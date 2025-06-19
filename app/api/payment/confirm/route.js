import { connectToDatabase } from "../../../../lib/db";
import { ObjectId } from "mongodb";
import crypto from "crypto";

export async function POST(req) {
  try {
    const {
      bookingId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = await req.json();

    // Validate inputs
    if (!bookingId) {
      return new Response(JSON.stringify({ message: "Missing bookingId" }), {
        status: 400,
      });
    }
    if (!razorpay_payment_id) {
      return new Response(
        JSON.stringify({ message: "Missing razorpay_payment_id" }),
        { status: 400 }
      );
    }
    if (!razorpay_order_id) {
      return new Response(
        JSON.stringify({ message: "Missing razorpay_order_id" }),
        { status: 400 }
      );
    }
    if (!razorpay_signature) {
      return new Response(
        JSON.stringify({ message: "Missing razorpay_signature" }),
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_API_SECRET);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return new Response(
        JSON.stringify({ message: "Invalid payment signature" }),
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Update booking status
    const result = await db.collection("bookings").updateOne(
      { _id: new ObjectId(bookingId), status: "pending" },
      {
        $set: {
          status: "confirmed",
          razorpay_payment_id,
          razorpay_order_id,
          updatedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ message: "Booking not found or already confirmed" }),
        { status: 400 }
      );
    }

    return new Response(JSON.stringify({ message: "Payment confirmed" }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
