"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import BookingForm from "../../../components/BookingForm";
import ItineraryPlanner from "../../../components/ItineraryPlanner"; // NEW IMPORT
import {
  Star,
  Heart,
  Share,
  MapPin,
  Users,
  Wifi,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Flame,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ListingDetails() {
  const [listing, setListing] = useState(null);
  const [host, setHost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    console.log("ListingDetails: Fetching listing for ID:", params.id);
    if (!params.id) {
      setError("Invalid listing ID");
      setLoading(false);
      return;
    }

    // Fetch listing
    fetch(`/api/listings/${params.id}`)
      .then(async (res) => {
        console.log("ListingDetails: /api/listings/[id] status:", res.status);
        const data = await res.json();
        console.log("ListingDetails: /api/listings/[id] data:", data);
        return { res, data };
      })
      .then(({ res, data }) => {
        if (res.status === 200) {
          setListing(data);
        } else {
          setError(data.message || "Failed to load listing");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("ListingDetails: Fetch error:", err.message);
        setError("Network error occurred");
        setLoading(false);
      });

    // Fetch reviews
    fetch(`/api/listings/${params.id}/reviews`)
      .then(async (res) => {
        console.log(
          "ListingDetails: /api/listings/[id]/reviews status:",
          res.status
        );
        const data = await res.json();
        console.log("ListingDetails: /api/listings/[id]/reviews data:", data);
        return { res, data };
      })
      .then(({ res, data }) => {
        if (res.status === 200) {
          setReviews(data);
        }
      })
      .catch((err) => {
        console.error("ListingDetails: Fetch reviews error:", err.message);
      });

    // Fetch user
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(async (res) => {
          const data = await res.json();
          console.log("ListingDetails: /api/auth/me data:", data);
          if (res.ok) {
            setUser(data);
          }
        })
        .catch((err) => {
          console.error("ListingDetails: Fetch user error:", err.message);
        });
    }
  }, [params.id]);

  useEffect(() => {
    if (!listing) return;

    // Fetch host details
    console.log("ListingDetails: Fetching host for ID:", listing.hostId);
    fetch(`/api/users/${listing.hostId}`)
      .then(async (res) => {
        console.log("ListingDetails: /api/users/[id] status:", res.status);
        const data = await res.json();
        console.log("ListingDetails: /api/users/[id] data:", data);
        return { res, data };
      })
      .then(({ res, data }) => {
        if (res.status === 200) {
          setHost(data);
        } else {
          toast.error(data.message || "Failed to load host details");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("ListingDetails: Host fetch error:", err.message);
        toast.error("Network error occurred");
        setLoading(false);
      });
  }, [listing]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      toast.error("Please log in to submit a review");
      router.push("/login");
      return;
    }

    if (newReview.comment.length < 10) {
      setError("Comment must be at least 10 characters");
      toast.error("Comment must be at least 10 characters");
      return;
    }

    try {
      const res = await fetch(`/api/listings/${params.id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newReview),
      });
      const data = await res.json();
      console.log(
        "ListingDetails: /api/listings/[id]/reviews POST status:",
        res.status
      );
      if (res.ok) {
        setReviews([...reviews, { ...data, user: { email: user.email } }]);
        setNewReview({ rating: 5, comment: "" });
        toast.success("Review submitted successfully!");

        // Refresh listing to update rating and reviews
        const listingRes = await fetch(`/api/listings/${params.id}`);
        const listingData = await listingRes.json();
        if (listingRes.status === 200) {
          setListing(listingData);
        }
      } else {
        setError(data.message || "Failed to submit review");
        toast.error(data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("ListingDetails: Submit review error:", err.message);
      setError("Network error occurred");
      toast.error("Network error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-gray-900 text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Error</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!listing || !host) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Listing Not Found
          </h1>
        </div>
      </div>
    );
  }

  const property = {
    ...listing,
    host: {
      name: host.name || "Anonymous Host",
      avatar:
        host.avatar ||
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200",
      joinDate: host.joinDate || "Joined recently",
      verified: host.verified || false,
    },
    amenities: listing.amenities?.length
      ? listing.amenities.map((name, index) => ({
          name,
          icon:
            [Waves, Wifi, Utensils, Car, Waves, Dumbbell, Flame, Shield][
              index % 8
            ] || Waves,
        }))
      : [
          { name: "WiFi", icon: Wifi },
          { name: "Parking", icon: Car },
          { name: "Kitchen", icon: Utensils },
        ],
    details: {
      guests: listing.details?.guests || 2,
      bedrooms: listing.details?.bedrooms || 1,
      beds: listing.details?.beds || 1,
      bathrooms: listing.details?.bathrooms || 1,
    },
    description: listing.description || "No description provided.",
    rating: listing.rating || "N/A",
    reviews: listing.reviews || 0,
    images: listing.images?.length
      ? listing.images
      : [
          listing.image ||
            "https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600",
        ],
  };

  const handleImageChange = (direction) => {
    if (!property.images?.length) return;
    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {property.title}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{property.rating}</span>
                <span className="text-gray-500">
                  ({property.reviews} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{property.location}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Share className="w-4 h-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Heart className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="relative rounded-2xl overflow-hidden mb-8">
          <div className="relative w-full h-64 sm:h-80 md:h-96">
            <Image
              src={property.images[currentImageIndex]}
              alt={property.title}
              fill
              className="object-cover hover:opacity-90 transition-opacity"
            />
          </div>
          {property.images.length > 1 && (
            <>
              <button
                onClick={() => handleImageChange("prev")}
                className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              >
                <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6 text-gray-800" />
              </button>
              <button
                onClick={() => handleImageChange("next")}
                className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
              >
                <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6 text-gray-800" />
              </button>
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
                {property.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                      index === currentImageIndex ? "bg-white" : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6 md:space-y-8">
            {/* Property Info */}
            <div className="border-b border-gray-200 pb-6 md:pb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-gray-600 text-sm sm:text-base">
                  <span>{property.details.guests} guests</span>
                  <span>•</span>
                  <span>{property.details.bedrooms} bedrooms</span>
                  <span>•</span>
                  <span>{property.details.beds} beds</span>
                  <span>•</span>
                  <span>{property.details.bathrooms} bathrooms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src={property.host.avatar}
                      alt={property.host.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  {property.host.verified && (
                    <div className="flex items-center space-x-1 text-sm text-green-600">
                      <Shield className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="border-b border-gray-200 pb-6 md:pb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                About this place
              </h3>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
                {property.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="border-b border-gray-200 pb-6 md:pb-8">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                What this place offers
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <amenity.icon className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 text-sm sm:text-base">
                      {amenity.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg sm:text-xl font-semibold">
                    {property.rating}
                  </span>
                </div>
                <span className="text-gray-500 text-sm sm:text-base">
                  • {property.reviews} reviews
                </span>
              </div>
              {reviews.length === 0 ? (
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  No reviews yet. Be the first to share your experience!
                </p>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {(showAllReviews ? reviews : reviews.slice(0, 3)).map(
                    (review) => (
                      <div
                        key={review._id}
                        className="flex space-x-3 sm:space-x-4"
                      >
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12">
                          <Image
                            src={
                              review.user.avatar ||
                              "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200"
                            }
                            alt={review.user.email}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                              {review.user.email}
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mb-2">
                            {[...Array(review.rating || 5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 sm:w-4 h-3 sm:h-4 text-yellow-400 fill-current"
                              />
                            ))}
                          </div>
                          <p className="text-gray-700 text-sm sm:text-base">
                            {review.comment}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              {reviews.length > 3 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="mt-4 sm:mt-6 text-blue-600 hover:underline text-sm sm:text-base"
                >
                  {showAllReviews ? "Show Less" : "Show All Reviews"}
                </button>
              )}

              {/* Review Submission Form */}
              <div className="mt-6 sm:mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  Write a Review
                </h3>
                {error && (
                  <p className="text-red-500 mb-4 text-sm sm:text-base">
                    {error}
                  </p>
                )}
                {user ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                        Rating
                      </label>
                      <select
                        value={newReview.rating}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            rating: Number(e.target.value),
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <option key={num} value={num}>
                            {num} Star{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2 text-sm sm:text-base">
                        Comment
                      </label>
                      <textarea
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview({
                            ...newReview,
                            comment: e.target.value,
                          })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
                        rows="4 sm:rows-5"
                        placeholder="Share your experience..."
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-red-500 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-200 text-sm sm:text-base"
                    >
                      Submit Review
                    </button>
                  </form>
                ) : (
                  <p className="text-gray-600 text-sm sm:text-base">
                    Please{" "}
                    <button
                      onClick={() => router.push("/login")}
                      className="text-red-500 hover:underline"
                    >
                      log in
                    </button>{" "}
                    to write a review.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Booking and Itinerary */}
          <div className="md:col-span-1 space-y-6">
            <div className="sticky top-24">
              {/* Itinerary Planner */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 sm:p-6 mt-6 animate-slide-up">
                <ItineraryPlanner
                  location={property.location}
                  listingId={listing._id}
                />
              </div>
              {/* Booking Card */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-4 sm:p-6 animate-slide-up">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      ₹{property.price}
                    </span>
                    <span className="text-gray-500 text-sm sm:text-base">
                      / night
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium text-sm sm:text-base">
                      {property.rating}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      ({property.reviews})
                    </span>
                  </div>
                </div>
                <BookingForm
                  listingId={listing._id}
                  price={listing.price}
                  maxGuests={property.details.guests}
                />
                <p className="text-center text-xs sm:text-sm text-gray-500 mt-4">
                  Pay via UPI, Netbanking, or Wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
