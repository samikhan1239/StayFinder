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
    console.log("Bookings POST: User:", user ? user.email : "No user");
    if (!user) {
      console.log("Bookings POST: Unauthorized");
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
    console.log("Bookings POST: Received request:", {
      listingId,
      checkIn,
      checkOut,
      price,
      guests,
      firstName,
      lastName,
      email,
      phone,
    });

    // Validate inputs
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
      console.log("Bookings POST: Missing fields:", missingFields);
      return NextResponse.json(
        { message: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(listingId)) {
      console.log("Bookings POST: Invalid listingId:", listingId);
      return NextResponse.json(
        { message: "Invalid listing ID format" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.log("Bookings POST: Invalid email:", email);
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate phone (Indian phone number, 10 digits)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      console.log("Bookings POST: Invalid phone:", phone);
      return NextResponse.json(
        {
          message:
            "Invalid phone number (must be 10 digits, starting with 6-9)",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(price) || price < 100) {
      console.log("Bookings POST: Invalid price:", price);
      return NextResponse.json(
        { message: "Price must be at least ₹100" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(guests) || guests < 1) {
      console.log("Bookings POST: Invalid guests:", guests);
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
      console.log("Bookings POST: Invalid dates:", { checkIn, checkOut });
      return NextResponse.json(
        { message: "Invalid date format" },
        { status: 400 }
      );
    }

    if (checkInDate < today) {
      console.log("Bookings POST: Check-in date in past:", checkIn);
      return NextResponse.json(
        { message: "Check-in date cannot be in the past" },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      console.log("Bookings POST: Invalid date range:", { checkIn, checkOut });
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
      console.log("Bookings POST: Listing not found:", listingId);
      return NextResponse.json(
        { message: "Listing not found" },
        { status: 404 }
      );
    }

    const maxGuests = listing.details?.guests || 6;
    if (guests > maxGuests) {
      console.log("Bookings POST: Too many guests:", {
        guests,
        max: maxGuests,
      });
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
      console.log(
        "Bookings POST: Overlapping bookings found:",
        existingBookings.length
      );
      return NextResponse.json(
        { message: "Selected dates are not available" },
        { status: 409 }
      );
    }

    // Create Razorpay order
    let order;
    try {
      // Shorten receipt to fit within 40 characters
      const shortListingId = listingId.slice(-8); // Last 8 chars of listingId
      const shortTimestamp = Date.now().toString().slice(-6); // Last 6 chars of timestamp
      const receipt = `book_${shortListingId}_${shortTimestamp}`; // e.g., book_62998cb7_890123 (~20 chars)
      console.log("Bookings POST: Generated receipt:", receipt, {
        length: receipt.length,
      });

      order = await razorpay.orders.create({
        amount: price * 100, // Convert to paise
        currency: "INR",
        receipt,
        payment_capture: 1, // Auto-capture
        notes: {
          listingId: listingId.toString(),
          userId: user._id.toString(),
        },
      });
      console.log("Bookings POST: Razorpay order created:", order.id);
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

    console.log("Bookings POST: Booking created with ID:", result.insertedId);

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
    console.log("Bookings PUT: User:", user ? user.email : "No user");
    if (!user) {
      console.log("Bookings PUT: Unauthorized");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, razorpay_payment_id, razorpay_signature } =
      await request.json();
    console.log("Bookings PUT: Received request:", {
      bookingId,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!bookingId || !razorpay_payment_id || !razorpay_signature) {
      const missingFields = [];
      if (!bookingId) missingFields.push("bookingId");
      if (!razorpay_payment_id) missingFields.push("razorpay_payment_id");
      if (!razorpay_signature) missingFields.push("razorpay_signature");
      console.log("Bookings PUT: Missing fields:", missingFields);
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
      console.log(
        "Bookings PUT: Booking not found or unauthorized:",
        bookingId
      );
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
      console.log("Bookings PUT: Invalid Razorpay signature");
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
      console.log("Bookings PUT: Failed to update booking:", bookingId);
      return NextResponse.json(
        { message: "Failed to update booking" },
        { status: 500 }
      );
    }

    console.log(
      "Bookings PUT: Booking confirmed with payment ID:",
      razorpay_payment_id
    );

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
