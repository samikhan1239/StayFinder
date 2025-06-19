import { generateItinerary } from "../../../lib/itinerary";
import { connectToDatabase } from "../../../lib/db";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    console.log("API: Received POST /api/itinerary");
    console.log("API: Imported generateItinerary:", typeof generateItinerary);
    const { location, preferences, listingId } = await req.json();
    console.log("API: Request body:", { location, preferences, listingId });

    // Validate input
    if (!location || !preferences || !listingId) {
      console.error("API: Missing required fields:", {
        location,
        preferences,
        listingId,
      });
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        { status: 400 }
      );
    }

    if (
      !preferences.interests?.length ||
      !preferences.dining?.length ||
      !preferences.duration
    ) {
      console.error("API: Invalid preferences:", preferences);
      return new Response(
        JSON.stringify({
          message:
            "Invalid preferences: interests, dining, or duration missing",
        }),
        { status: 400 }
      );
    }

    // Validate ObjectId
    let objectId;
    try {
      objectId = new ObjectId(listingId);
    } catch (error) {
      console.error("API: Invalid listingId:", listingId, error.message);
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    // Connect to MongoDB
    console.log("API: Connecting to MongoDB...");
    const { db } = await connectToDatabase();
    console.log("API: Connected to MongoDB");

    // Verify listing exists
    const listing = await db.collection("listings").findOne({ _id: objectId });
    if (!listing) {
      console.error("API: Listing not found for ID:", listingId);
      return new Response(JSON.stringify({ message: "Listing not found" }), {
        status: 404,
      });
    }
    console.log("API: Listing found:", listing.title);

    // Check cache
    console.log("API: Checking cache...");
    const cache = await db.collection("itineraries").findOne({
      listingId: objectId,
      preferences: JSON.stringify(preferences),
    });
    if (cache) {
      console.log("API: Cache hit, returning cached itinerary");
      return new Response(JSON.stringify({ itinerary: cache.itinerary }), {
        status: 200,
      });
    }

    // Generate new itinerary
    console.log("API: Generating new itinerary...");
    if (typeof generateItinerary !== "function") {
      throw new Error("generateItinerary is not a function");
    }
    const itinerary = await generateItinerary({
      location,
      preferences,
      duration: preferences.duration,
    });

    // Cache the result
    console.log("API: Caching itinerary...");
    await db.collection("itineraries").insertOne({
      listingId: objectId,
      preferences: JSON.stringify(preferences),
      itinerary,
      createdAt: new Date(),
    });

    console.log("API: Itinerary generated and cached");
    return new Response(JSON.stringify({ itinerary }), { status: 200 });
  } catch (error) {
    console.error("API: Error in /api/itinerary:", error.message, error.stack);
    if (error.message.includes("rate limit")) {
      return new Response(
        JSON.stringify({
          message:
            "Gemini rate limit exceeded, please try again later or check your API quota",
        }),
        { status: 429 }
      );
    }
    if (error.message.includes("Invalid Gemini API key")) {
      return new Response(
        JSON.stringify({
          message: "Invalid Gemini API key, please check your configuration",
        }),
        { status: 401 }
      );
    }
    return new Response(
      JSON.stringify({
        message: "Failed to generate itinerary: " + error.message,
      }),
      { status: 500 }
    );
  }
}
