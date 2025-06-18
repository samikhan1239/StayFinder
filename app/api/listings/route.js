import { connectToDatabase } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
  console.log("Listings GET: Starting request at", new Date().toISOString());
  try {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
    const price = searchParams.get("price");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const hostId = searchParams.get("hostId");

    const query = {};
    if (location) query.location = new RegExp(location, "i");
    if (price) query.price = { $lte: parseInt(price) };
    if (hostId) {
      try {
        query.hostId = new ObjectId(hostId);
        console.log("Listings GET: Parsed hostId as ObjectId:", hostId);
      } catch (e) {
        console.error(
          "Listings GET: Invalid hostId format:",
          hostId,
          e.message
        );
        return new Response(JSON.stringify({ message: "Invalid hostId" }), {
          status: 400,
        });
      }
    }

    console.log("Listings GET: Query:", query);
    const { db } = await connectToDatabase();
    let listings = await db.collection("listings").find(query).toArray();

    if (checkIn && checkOut) {
      console.log("Listings GET: Filtering booked listings for dates:", {
        checkIn,
        checkOut,
      });
      const bookedListings = await db
        .collection("bookings")
        .find({
          $or: [
            { checkIn: { $lte: new Date(checkOut), $gte: new Date(checkIn) } },
            { checkOut: { $lte: new Date(checkOut), $gte: new Date(checkIn) } },
          ],
        })
        .toArray();
      const bookedIds = bookedListings.map((b) => b.listingId.toString());
      listings = listings.filter((l) => !bookedIds.includes(l._id.toString()));
      console.log(
        "Listings GET: Filtered out booked listings, remaining:",
        listings.length
      );
    }

    console.log("Listings GET: Fetched listings count:", listings.length);
    return new Response(JSON.stringify(listings), { status: 200 });
  } catch (error) {
    console.error("Listings GET: Error:", error.message, error.stack);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  console.log("Listings POST: Starting request at", new Date().toISOString());
  try {
    const user = await getUserFromToken(req);
    console.log("Listings POST: User:", user);
    if (!user) {
      console.log("Listings POST: No user, returning 401");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await req.json();
    console.log("Listings POST: Request data:", data);

    // Validate required fields
    const { title, description, location, price, image, amenities, details } =
      data;
    if (!title || !description || !location || !price || !image) {
      console.log("Listings POST: Missing required fields");
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
        }
      );
    }
    if (isNaN(parseInt(price)) || parseInt(price) <= 0) {
      console.log("Listings POST: Invalid price:", price);
      return new Response(JSON.stringify({ message: "Invalid price" }), {
        status: 400,
      });
    }

    // Validate details
    if (
      details &&
      (isNaN(details.guests) ||
        isNaN(details.bedrooms) ||
        isNaN(details.beds) ||
        isNaN(details.bathrooms))
    ) {
      console.log("Listings POST: Invalid details:", details);
      return new Response(
        JSON.stringify({ message: "Invalid property details" }),
        {
          status: 400,
        }
      );
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("listings").insertOne({
      title,
      description,
      location,
      price: parseInt(price),
      image,
      amenities: amenities || [],
      details: details || { guests: 1, bedrooms: 1, beds: 1, bathrooms: 1 },
      hostId: new ObjectId(user._id),
      createdAt: new Date(),
    });

    console.log("Listings POST: Created listing with ID:", result.insertedId);
    return new Response(
      JSON.stringify({
        message: "Listing created",
        listingId: result.insertedId,
      }),
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Listings POST: Error:", error.message, error.stack);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
