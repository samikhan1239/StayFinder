import { connectToDatabase } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);

    if (!user) {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }

    const { db } = await connectToDatabase();
    const userData = await db
      .collection("users")
      .findOne(
        { _id: new ObjectId(user._id) },
        { projection: { _id: 1, email: 1, name: 1 } }
      );

    if (!userData) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    const responseData = {
      _id: userData._id.toString(),
      email: userData.email,
      name: userData.name,
    };

    return new Response(JSON.stringify(responseData), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
