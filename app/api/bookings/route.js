import { connectToDatabase } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { ObjectId } from "mongodb";
import Razorpay from "razorpay";
import { NextResponse } from "next/server";

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

export async function POST(request) {
  try {
    if (!razorpay) {
      console.error("Bookings POST: Missing Razorpay credentials", {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET,
      });
      return NextResponse.json(
        { message: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      listingId,
      checkIn,
      checkOut,
      price,
      guests,
      firstName,
      lastName,
      email,
      phone,
    } = await request.json();

    if (
      !listingId ||
      !checkIn ||
      !checkOut ||
      !price ||
      !guests ||
      !firstName ||
      !lastName ||
      !email ||
      !phone
    ) {
      const missingFields = [];
      if (!listingId) missingFields.push("listingId");
      if (!checkIn) missingFields.push("checkIn");
      if (!checkOut) missingFields.push("checkOut");
      if (!price) missingFields.push("price");
      if (!guests) missingFields.push("guests");
      if (!firstName) missingFields.push("firstName");
      if (!lastName) missingFields.push("lastName");
      if (!email) missingFields.push("email");
      if (!phone) missingFields.push("phone");

      return NextResponse.json(
        { message: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(listingId)) {
      return NextResponse.json(
        { message: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone (Indian phone number, 10 digits)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        {
          message:
            "Invalid phone number (must be 10 digits, starting with 6-9)",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price < 100) {
      return NextResponse.json(
        { message: "Price must be at least ₹100" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(guests) || guests < 1) {
      return NextResponse.json(
        { message: "Guests must be at least 1" },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(checkInDate) || isNaN(checkOutDate)) {
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (checkInDate < today) {
      return NextResponse.json(
        { message: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { message: "Check-out date must be after check-in date" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Validate listing exists and guest count
    const listing = await db
      .collection("listings")
      .findOne({ _id: new ObjectId(listingId) });
    if (!listing) {
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    const maxGuests = listing.details?.guests || 6;
    if (guests > maxGuests) {
      return NextResponse.json(
        { message: `Maximum ${maxGuests} guests allowed` },
        { status: 400 }
      );
    }

    // Normalize dates to UTC midnight
    checkInDate.setHours(0, 0, 0, 0);
    checkOutDate.setHours(0, 0, 0, 0);

    // Check for overlapping bookings
    const existingBookings = await db
      .collection("bookings")
      .find({
        listingId: new ObjectId(listingId),
        $or: [
          { checkIn: { $lte: checkOutDate }, checkOut: { $gte: checkInDate } },
        ],
        status: { $in: ["pending", "confirmed"] },
      })
      .toArray();

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { message: "Selected dates are not available" },
        { status: 409 }
      );
    }

    // Create Razorpay order
    let order;
    try {
      const shortListingId = listingId.slice(-8);
      const shortTimestamp = Date.now().toString().slice(-6);
      const receipt = `book_${shortListingId}_${shortTimestamp}`;

      order = await razorpay.orders.create({
        amount: price * 100,
        currency: "INR",
        receipt,
        payment_capture: 1,
        notes: {
          listingId: listingId.toString(),
          userId: user._id.toString(),
        },
      });
    } catch (razorpayError) {
      console.error(
        "Bookings POST: Razorpay order creation failed:",
        razorpayError.message,
        razorpayError
      );
      return NextResponse.json(
        { message: "Failed to create payment order" },
        { status: 500 }
      );
    }

    // Create booking with personal details and Razorpay order ID
    const result = await db.collection("bookings").insertOne({
      listingId: new ObjectId(listingId),
      userId: new ObjectId(user._id),
      checkIn: checkInDate,
      checkOut: checkOutDate,
      price,
      guests,
      firstName,
      lastName,
      email,
      phone,
      status: "pending",
      razorpay_order_id: order.id,
      payment_status: "created",
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Booking initiated",
        bookingId: result.insertedId.toString(),
        razorpayOrder: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          key: process.env.RAZORPAY_KEY_ID,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bookings POST: Error:", {
      message: error.message,
      stack: error.stack,
      error,
    });
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    if (!razorpay) {
      console.error("Bookings PUT: Missing Razorpay credentials", {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET,
      });
      return NextResponse.json(
        { message: "Payment gateway configuration error" },
        { status: 500 }
      );
    }

    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!bookingId || !razorpay_payment_id || !razorpay_signature) {
      const missingFields = [];
      if (!bookingId) missingFields.push("bookingId");
      if (!razorpay_payment_id) missingFields.push("razorpay_payment_id");
      if (!razorpay_signature) missingFields.push("razorpay_signature");

      return NextResponse.json(
        { message: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Fetch booking
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

    // Verify Razorpay signature
    const crypto = await import("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${booking.razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Update booking with payment details
    const updateResult = await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          razorpay_payment_id,
          payment_status: "captured",
          status: "confirmed",
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.matchedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update booking" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Booking confirmed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Bookings PUT: Error:", {
      message: error.message,
      stack: error.stack,
      error,
    });
    return NextResponse.json(
      { message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
