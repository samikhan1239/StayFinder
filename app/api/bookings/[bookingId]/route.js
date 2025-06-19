// app/api/bookings/[bookingId]/route.js
import { connectToDatabase } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { bookingId } = params;

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { message: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id),
    });

    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error("Bookings GET: Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
