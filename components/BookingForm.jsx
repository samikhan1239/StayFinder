"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../utils/api";
import { Calendar, Users, Check } from "lucide-react";

export default function BookingForm({ listingId, price, listing }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  // Fallback for maxGuests
  const maxGuests = listing?.details?.guests || 6;

  // Debug maxGuests and guest selection
  useEffect(() => {
    console.log("BookingForm: maxGuests:", maxGuests, {
      listingId,
      hasListing: !!listing,
      hasDetails: !!listing?.details,
      guests: listing?.details?.guests,
    });
  }, [listing, maxGuests, listingId]);

  const totalNights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;
  const subtotal = totalNights * price;
  const serviceFee = Math.round(subtotal * 0.14);
  const taxes = Math.round(subtotal * 0.08);
  const total = subtotal + serviceFee + taxes;

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log("BookingForm: Razorpay SDK already loaded");
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        console.log("BookingForm: Razorpay SDK loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("BookingForm: Failed to load Razorpay SDK");
        reject(new Error("Failed to load Razorpay SDK"));
      };
      document.body.appendChild(script);
    });
  };

  const waitForRazorpay = (callback, retries = 20, delay = 500) => {
    if (window.Razorpay) {
      console.log("BookingForm: Razorpay SDK available");
      callback();
      return;
    }
    if (retries === 0) {
      console.error("BookingForm: Razorpay SDK failed to load after retries");
      toast.error(
        "Payment service unavailable. Please try again later or contact support."
      );
      setIsLoading(false);
      return;
    }
    console.log(
      "BookingForm: Checking for Razorpay SDK, retries left:",
      retries
    );
    setTimeout(() => {
      waitForRazorpay(callback, retries - 1, delay);
    }, delay);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log("BookingForm: Starting booking for listing ID:", listingId, {
        guests,
        maxGuests,
        checkIn,
        checkOut,
      });
      const token = localStorage.getItem("token");
      console.log(
        "BookingForm: Token:",
        token ? token.substring(0, 20) + "..." : "No token"
      );
      if (!token) {
        console.log("BookingForm: No token, redirecting to /login");
        toast.error("Please login to book");
        router.push("/login");
        return;
      }

      // Validate email and phone
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Invalid email format");
        setIsLoading(false);
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        toast.error(
          "Invalid phone number (must be 10 digits, starting with 6-9)"
        );
        setIsLoading(false);
        return;
      }

      // Validate dates
      if (!checkIn || !checkOut) {
        toast.error("Please select check-in and check-out dates");
        setIsLoading(false);
        return;
      }
      if (new Date(checkOut) <= new Date(checkIn)) {
        toast.error("Check-out date must be after check-in date");
        setIsLoading(false);
        return;
      }

      const res = await fetchWithAuth("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          listingId,
          checkIn,
          checkOut,
          price: total,
          guests,
          firstName,
          lastName,
          email,
          phone,
        }),
      });
      const data = await res.json();
      console.log("BookingForm: Booking response:", {
        status: res.status,
        data,
      });
      if (res.status === 201) {
        const { bookingId, razorpayOrder } = data;
        if (!bookingId || !razorpayOrder) {
          console.error(
            "BookingForm: Missing bookingId or razorpayOrder:",
            data
          );
          toast.error("Booking created, but payment cannot be initiated");
          setIsLoading(false);
          return;
        }
        console.log("BookingForm: Price sent to payment:", total);
        console.log("BookingForm: Booking ID sent to payment:", bookingId);
        await loadRazorpayScript();
        waitForRazorpay(() => {
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "StayFinder",
            description: `Booking for listing ${listingId}`,
            order_id: razorpayOrder.id,
            handler: async function (response) {
              console.log("BookingForm: Razorpay payment response:", response);
              try {
                const verifyRes = await fetchWithAuth("/api/bookings", {
                  method: "PUT",
                  body: JSON.stringify({
                    bookingId,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });
                const verifyData = await verifyRes.json();
                console.log(
                  "BookingForm: Payment verification response:",
                  verifyData
                );
                if (!verifyRes.ok) {
                  throw new Error(
                    verifyData.message || "Payment verification failed"
                  );
                }
                toast.success("Booking confirmed!");
                router.push(`/bookings/confirmed/${bookingId}`);
              } catch (error) {
                console.error(
                  "BookingForm: Payment verification error:",
                  error.message
                );
                toast.error(error.message || "Payment verification failed");
              }
            },
            prefill: {
              name: `${firstName} ${lastName}`,
              email,
              contact: phone,
            },
            theme: {
              color: "#EF4444",
            },
            payment_method: {
              card: false,
              upi: true,
              netbanking: true,
              wallet: true,
            },
          };
          try {
            const rzp = new window.Razorpay(options);
            rzp.open();
          } catch (error) {
            console.error(
              "BookingForm: Error opening Razorpay modal:",
              error.message
            );
            toast.error("Failed to open payment modal. Please try again.");
          }
        });
      } else {
        toast.error(data.message || "Failed to book");
      }
    } catch (error) {
      console.error("BookingForm: Error:", error.message);
      toast.error(error.message || "Failed to book");
      if (error.message === "Unauthorized") {
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (type) => (e) => {
    const value = e.target.value;
    console.log(`BookingForm: ${type} date changed:`, value);
    if (type === "checkIn") {
      setCheckIn(value);
      // Reset checkOut if it's before the new checkIn
      if (checkOut && new Date(checkOut) <= new Date(value)) {
        setCheckOut("");
      }
    } else {
      setCheckOut(value);
    }
  };

  const steps = [
    { number: 1, title: "Dates & Guests", completed: currentStep > 1 },
    { number: 2, title: "Your Information", completed: currentStep > 2 },
    { number: 3, title: "Payment", completed: false },
  ];

  return (
    <div>
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-center space-x-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.number
                    ? "bg-red-500 border-red-500 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {step.completed ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <span
                className={`ml-3 font-medium ${
                  currentStep >= step.number ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleBooking} className="space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Select Dates & Guests</h2>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Check-in
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={handleDateChange("checkIn")}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <Calendar className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Check-out
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkOut}
                    onChange={handleDateChange("checkOut")}
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  />
                  <Calendar className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Guests
              </label>
              <div className="relative">
                <select
                  value={guests}
                  onChange={(e) => {
                    setGuests(Number(e.target.value));
                    console.log(
                      "BookingForm: Guest selection changed:",
                      e.target.value
                    );
                  }}
                  className="w-full p-2 pr-10 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  {[...Array(maxGuests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} guest{i + 1 > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <Users className="absolute right-2 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="w-full py-2 bg-red-500 text-white rounded-md disabled:opacity-50"
              disabled={!checkIn || !checkOut || !guests}
            >
              Next
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-red-500 focus:ring-red-500"
                required
              />
              <label className="ml-2 text-sm text-gray-700">
                I agree to the terms and conditions
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full py-2 bg-red-500 text-white rounded-md disabled:opacity-50"
                disabled={
                  !firstName || !lastName || !email || !phone || !agreedToTerms
                }
              >
                Next
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Payment</h2>
            <div className="border p-4 rounded-md">
              <p>
                <strong>Subtotal:</strong> ₹{subtotal}
              </p>
              <p>
                <strong>Service Fee (14%):</strong> ₹{serviceFee}
              </p>
              <p>
                <strong>Taxes (8%):</strong> ₹{taxes}
              </p>
              <p>
                <strong>Total:</strong> ₹{total}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-2 bg-gray-300 text-gray-700 rounded-md"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-red-500 text-white rounded-md disabled:opacity-50"
              >
                {isLoading ? "Processing..." : "Complete Booking"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
