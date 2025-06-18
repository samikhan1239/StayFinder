import Razorpay from "razorpay";

export async function POST(req) {
  try {
    const { amount, bookingId } = await req.json();

    if (!amount || !bookingId) {
      return new Response(
        JSON.stringify({ message: "Amount and booking ID are required" }),
        { status: 400 }
      );
    }

    if (!Number.isInteger(amount) || amount < 100) {
      return new Response(
        JSON.stringify({ message: "Amount must be at least ₹100" }),
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_API_KEY,
      key_secret: process.env.RAZORPAY_API_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: "INR",
      receipt: `booking_${bookingId}`,
    });

    return new Response(JSON.stringify({ order }), { status: 200 });
  } catch (error) {
    console.error("Payment error:", error.message, error.stack);
    return new Response(JSON.stringify({ message: "Something went wrong" }), {
      status: 500,
    });
  }
}
