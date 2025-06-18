// app/api/bookings/[bookingId]/route.js
import { connectToDatabase } from "../../../../lib/db";
import { getUserFromToken } from "../../../../lib/auth";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { bookingId } = params;
    console.log("Bookings GET: Fetching booking ID:", bookingId);

    if (!ObjectId.isValid(bookingId)) {
      console.log("Bookings GET: Invalid bookingId:", bookingId);
      return NextResponse.json(
        { message: "Invalid booking ID format" },
        { status: 400 }
      );
    }

    const user = await getUserFromToken(request);
    console.log("Bookings GET: User:", user ? user.email : "No user");
    if (!user) {
      console.log("Bookings GET: Unauthorized");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const booking = await db.collection("bookings").findOne({
      _id: new ObjectId(bookingId),
      userId: new ObjectId(user._id),
    });

    if (!booking) {
      console.log("Bookings GET: Booking not found:", bookingId);
      return NextResponse.json(
        { message: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    console.log("Bookings GET: Booking fetched:", booking._id);
    return NextResponse.json(booking, { status: 200 });
  } catch (error) {
    console.error("Bookings GET: Error:", error.message);
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
