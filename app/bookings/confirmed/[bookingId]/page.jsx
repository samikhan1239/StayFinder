// app/bookings/confirmed/[bookingId]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/utils/api";

export default function BookingConfirmed() {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log(
          "BookingConfirmed: Token:",
          token ? token.substring(0, 20) + "..." : "No token"
        );
        if (!token) {
          setError("Please log in to view this page.");
          router.push("/login");
          return;
        }

        // Fetch booking
        const bookingRes = await fetchWithAuth(`/api/bookings/${bookingId}`, {
          method: "GET",
        });
        console.log(
          "BookingConfirmed: Booking response status:",
          bookingRes.status
        );

        // Check content-type
        const contentType = bookingRes.headers.get("content-type");
        console.log("BookingConfirmed: Content-Type:", contentType);
        if (!contentType || !contentType.includes("application/json")) {
          const text = await bookingRes.text();
          console.log(
            "BookingConfirmed: Non-JSON response:",
            text.slice(0, 100)
          );
          throw new Error("Received non-JSON response from server");
        }

        const bookingData = await bookingRes.json();
        console.log("BookingConfirmed: Booking response:", bookingData);
        if (!bookingRes.ok) {
          throw new Error(bookingData.message || "Failed to fetch booking");
        }
        setBooking(bookingData);

        // Fetch listing
        const listingRes = await fetchWithAuth(
          `/api/listings/${bookingData.listingId}`,
          { method: "GET" }
        );
        const listingData = await listingRes.json();
        console.log("BookingConfirmed: Listing response:", listingData);
        if (!listingRes.ok) {
          throw new Error(listingData.message || "Failed to fetch listing");
        }
        setListing(listingData);
      } catch (err) {
        console.error("BookingConfirmed: Error:", err.message);
        setError(err.message || "Something went wrong");
        if (
          err.message === "Unauthorized" ||
          err.message.includes("Please log in")
        ) {
          router.push("/login");
        }
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, router]);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">
          {error.includes("Unauthorized") ? "Unauthorized" : "Error"}
        </h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!booking || !listing) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-green-500 mb-6">
        Booking Confirmed!
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{listing.title}</h2>
        <div className="space-y-2">
          <p>
            <strong>Booking ID:</strong> {booking._id}
          </p>
          <p>
            <strong>Check-in:</strong>{" "}
            {new Date(booking.checkIn).toLocaleDateString()}
          </p>
          <p>
            <strong>Check-out:</strong>{" "}
            {new Date(booking.checkOut).toLocaleDateString()}
          </p>
          <p>
            <strong>Guests:</strong> {booking.guests} guest
            {booking.guests > 1 ? "s" : ""}
          </p>
          <p>
            <strong>Total Price:</strong> ₹{booking.price}
          </p>
          <p>
            <strong>Name:</strong> {booking.firstName} {booking.lastName}
          </p>
          <p>
            <strong>Email:</strong> {booking.email}
          </p>
          <p>
            <strong>Phone:</strong> {booking.phone}
          </p>
          <p>
            <strong>Payment Status:</strong>{" "}
            {booking.payment_status === "captured" ? "Paid" : "Pending"}
          </p>
          <p>
            <strong>Booking Status:</strong>{" "}
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </p>
        </div>
        <a
          href="/dashboard"
          className="mt-6 inline-block py-2 px-4 bg-red-500 text-white rounded-md"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
