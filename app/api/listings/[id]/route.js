import { connectToDatabase } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    const { db } = await connectToDatabase();
    const listing = await db
      .collection("listings")
      .findOne({ _id: new ObjectId(params.id) });

    if (!listing) {
      return new Response(JSON.stringify({ message: "Listing not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(listing), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function PUT(req, { params }) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    const user = await getUserFromToken(req);
    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const data = await req.json();
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
      return new Response(JSON.stringify({ message: "Invalid title" }), {
        status: 400,
      });
    }
    if (description && typeof description !== "string") {
      return new Response(JSON.stringify({ message: "Invalid description" }), {
        status: 400,
      });
    }
    if (location && typeof location !== "string") {
      return new Response(JSON.stringify({ message: "Invalid location" }), {
        status: 400,
      });
    }
    if (price && (isNaN(price) || price <= 0)) {
      return new Response(JSON.stringify({ message: "Invalid price" }), {
        status: 400,
      });
    }
    if (image && typeof image !== "string") {
      return new Response(JSON.stringify({ message: "Invalid image URL" }), {
        status: 400,
      });
    }
    if (amenities && !Array.isArray(amenities)) {
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
        return new Response(JSON.stringify({ message: "Invalid details" }), {
          status: 400,
        });
      }
    }
    if (status && !["Active", "Draft"].includes(status)) {
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
      return new Response(
        JSON.stringify({ message: "Listing not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Listing updated successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function DELETE(req, { params }) {
  try {
    if (!ObjectId.isValid(params.id)) {
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }

    const user = await getUserFromToken(req);
    if (!user) {
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
      return new Response(
        JSON.stringify({ message: "Listing not found or unauthorized" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Listing deleted successfully" }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
