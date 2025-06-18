// app/api/listings/[id]/reviews/route.js
import { connectToDatabase } from "@/lib/db";
import { getUserFromToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  console.log(
    "Reviews GET: Fetching reviews for listing ID:",
    params.id,
    "at",
    new Date().toISOString()
  );
  try {
    if (!/^[0-9a-f]{24}$/.test(params.id)) {
      console.log("Reviews GET: Invalid listing ID:", params.id);
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }
    const { db } = await connectToDatabase();
    const reviews = await db
      .collection("reviews")
      .aggregate([
        { $match: { listingId: new ObjectId(params.id) } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        { $project: { "user.password": 0 } },
      ])
      .toArray();
    console.log("Reviews GET: Fetched reviews count:", reviews.length);
    return new Response(JSON.stringify(reviews), { status: 200 });
  } catch (error) {
    console.error("Reviews GET: Error:", error.message, error.stack);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function POST(req, { params }) {
  console.log(
    "Reviews POST: Creating review for listing ID:",
    params.id,
    "at",
    new Date().toISOString()
  );
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      console.log("Reviews POST: Unauthorized access");
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    if (!/^[0-9a-f]{24}$/.test(params.id)) {
      console.log("Reviews POST: Invalid listing ID:", params.id);
      return new Response(JSON.stringify({ message: "Invalid listing ID" }), {
        status: 400,
      });
    }
    const { rating, comment } = await req.json();
    if (
      !rating ||
      rating < 1 ||
      rating > 5 ||
      !comment ||
      comment.length < 10
    ) {
      console.log("Reviews POST: Invalid input:", { rating, comment });
      return new Response(JSON.stringify({ message: "Invalid input" }), {
        status: 400,
      });
    }
    const { db } = await connectToDatabase();
    const review = {
      listingId: new ObjectId(params.id),
      userId: new ObjectId(user._id),
      rating: parseInt(rating),
      comment,
      createdAt: new Date(),
    };
    const result = await db.collection("reviews").insertOne(review);
    console.log("Reviews POST: Created review with ID:", result.insertedId);

    // Update listing rating and reviews count
    const reviews = await db
      .collection("reviews")
      .find({ listingId: new ObjectId(params.id) })
      .toArray();
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
    await db
      .collection("listings")
      .updateOne(
        { _id: new ObjectId(params.id) },
        { $set: { rating: avgRating, reviews: reviews.length } }
      );
    console.log(
      "Reviews POST: Updated listing rating:",
      avgRating,
      "reviews count:",
      reviews.length
    );

    return new Response(
      JSON.stringify({
        ...review,
        _id: result.insertedId,
        user: { email: user.email },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Reviews POST: Error:", error.message, error.stack);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
