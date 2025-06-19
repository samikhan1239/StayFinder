import { connectToDatabase } from "../../../../lib/db";
import { ObjectId } from "mongodb";

export async function GET(req, { params }) {
  try {
    if (!ObjectId.isValid(params.id)) {
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
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
