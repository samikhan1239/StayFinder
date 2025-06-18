import { connectToDatabase } from "../../../../lib/db";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  console.log("Users/[id] GET: Requested ID:", params.id);
  try {
    if (!ObjectId.isValid(params.id)) {
      console.log("Users/[id] GET: Invalid ObjectId:", params.id);
      return new Response(JSON.stringify({ message: "Invalid user ID" }), {
        status: 400,
      });
    }

    const { db } = await connectToDatabase();
    const user = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(params.id) },
        { projection: { name: 1, avatar: 1, joinDate: 1, verified: 1 } }
      );

    if (!user) {
      console.log("Users/[id] GET: User not found for ID:", params.id);
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    console.log("Users/[id] GET: Found user:", user.name);
    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    console.error("Users/[id] GET: Error:", error.message);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
