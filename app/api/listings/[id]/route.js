import { connectToDatabase } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  console.log("Listings/[id] GET: Requested ID:", params.id);
  try {
    if (!ObjectId.isValid(params.id)) {
      console.log("Listings/[id] GET: Invalid ObjectId:", params.id);
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    const { db } = await connectToDatabase();
    const listing = await db
      .collection("listings")
      .findOne({ _id: new ObjectId(params.id) });

    if (!listing) {
      console.log("Listings/[id] GET: Listing not found for ID:", params.id);
      return new Response(JSON.stringify({ message: "Listing not found" }), {
        status: 404,
      });
    }

    console.log("Listings/[id] GET: Found listing:", listing.title);
    return new Response(JSON.stringify(listing), { status: 200 });
  } catch (error) {
    console.error("Listings/[id] GET: Error:", error.message);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  console.log("Listings/[id] PUT: Starting request for ID:", params.id);
  try {
    if (!ObjectId.isValid(params.id)) {
      console.log("Listings/[id] PUT: Invalid ObjectId:", params.id);
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    const user = await getUserFromToken(req);
    console.log("Listings/[id] PUT: User:", user ? user.email : "No user");
    if (!user) {
      console.log("Listings/[id] PUT: Unauthorized");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await req.json();
    console.log("Listings/[id] PUT: Request data:", data);
    const {
      title,
      description,
      location,
      price,
      image,
      amenities,
      details,
      status,
    } = data;

    // Validate required fields if provided
    if (title && typeof title !== "string") {
      console.log("Listings/[id] PUT: Invalid title:", title);
      return new Response(JSON.stringify({ message: "Invalid title" }), {
        status: 400,
      });
    }
    if (description && typeof description !== "string") {
      console.log("Listings/[id] PUT: Invalid description:", description);
      return new Response(JSON.stringify({ message: "Invalid description" }), {
        status: 400,
      });
    }
    if (location && typeof location !== "string") {
      console.log("Listings/[id] PUT: Invalid location:", location);
      return new Response(JSON.stringify({ message: "Invalid location" }), {
        status: 400,
      });
    }
    if (price && (isNaN(price) || price <= 0)) {
      console.log("Listings/[id] PUT: Invalid price:", price);
      return new Response(JSON.stringify({ message: "Invalid price" }), {
        status: 400,
      });
    }
    if (image && typeof image !== "string") {
      console.log("Listings/[id] PUT: Invalid image URL:", image);
      return new Response(JSON.stringify({ message: "Invalid image URL" }), {
        status: 400,
      });
    }
    if (amenities && !Array.isArray(amenities)) {
      console.log("Listings/[id] PUT: Invalid amenities:", amenities);
      return new Response(JSON.stringify({ message: "Invalid amenities" }), {
        status: 400,
      });
    }
    if (details) {
      if (
        typeof details !== "object" ||
        isNaN(details.guests) ||
        isNaN(details.bedrooms) ||
        isNaN(details.beds) ||
        isNaN(details.bathrooms) ||
        details.guests < 1 ||
        details.bedrooms < 1 ||
        details.beds < 1 ||
        details.bathrooms < 1
      ) {
        console.log("Listings/[id] PUT: Invalid details:", details);
        return new Response(JSON.stringify({ message: "Invalid details" }), {
          status: 400,
        });
      }
    }
    if (status && !["Active", "Draft"].includes(status)) {
      console.log("Listings/[id] PUT: Invalid status:", status);
      return new Response(JSON.stringify({ message: "Invalid status" }), {
        status: 400,
      });
    }

    // Build update object with provided fields only
    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;
    if (location) updateFields.location = location;
    if (price) updateFields.price = parseInt(price);
    if (image) updateFields.image = image;
    if (amenities) updateFields.amenities = amenities;
    if (details)
      updateFields.details = {
        guests: parseInt(details.guests),
        bedrooms: parseInt(details.bedrooms),
        beds: parseInt(details.beds),
        bathrooms: parseInt(details.bathrooms),
      };
    if (status) updateFields.status = status;

    if (Object.keys(updateFields).length === 0) {
      console.log("Listings/[id] PUT: No fields provided for update");
      return new Response(JSON.stringify({ message: "No fields to update" }), {
        status: 400,
      });
    }

    const { db } = await connectToDatabase();
    const result = await db
      .collection("listings")
      .updateOne(
        { _id: new ObjectId(params.id), hostId: new ObjectId(user._id) },
        { $set: updateFields }
      );

    if (result.matchedCount === 0) {
      console.log("Listings/[id] PUT: Listing not found or not owned by user");
      return new Response(
        JSON.stringify({ message: "Listing not found or unauthorized" }),
        { status: 404 }
      );
    }

    console.log(
      "Listings/[id] PUT: Updated listing with fields:",
      updateFields
    );
    return new Response(
      JSON.stringify({ message: "Listing updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Listings/[id] PUT: Error:", error.message);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  console.log("Listings/[id] DELETE: Starting request for ID:", params.id);
  try {
    if (!ObjectId.isValid(params.id)) {
      console.log("Listings/[id] DELETE: Invalid ObjectId:", params.id);
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    const user = await getUserFromToken(req);
    console.log("Listings/[id] DELETE: User:", user ? user.email : "No user");
    if (!user) {
      console.log("Listings/[id] DELETE: Unauthorized");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { db } = await connectToDatabase();
    const result = await db.collection("listings").deleteOne({
      _id: new ObjectId(params.id),
      hostId: new ObjectId(user._id),
    });

    if (result.deletedCount === 0) {
      console.log(
        "Listings/[id] DELETE: Listing not found or not owned by user"
      );
      return new Response(
        JSON.stringify({ message: "Listing not found or unauthorized" }),
        { status: 404 }
      );
    }

    console.log("Listings/[id] DELETE: Listing deleted successfully");
    return new Response(
      JSON.stringify({ message: "Listing deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Listings/[id] DELETE: Error:", error.message);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
