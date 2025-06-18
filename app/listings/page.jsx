"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import SearchBar from "../../components/SearchBar";

// Fallback component for Suspense
function ListingsPageFallback() {
  return (
    <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
      <div className="text-gray-900 text-xl" aria-live="polite">
        Loading listings...
      </div>
    </div>
  );
}

// Component containing useSearchParams and main logic
function ListingsContent() {
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      const location = searchParams.get("location");
      const checkIn = searchParams.get("checkIn");
      const checkOut = searchParams.get("checkOut");
      const guests = searchParams.get("guests");
      const price = searchParams.get("price");

      const query = new URLSearchParams();
      if (location) query.set("location", location);
      if (checkIn) query.set("checkIn", checkIn);
      if (checkOut) query.set("checkOut", checkOut);
      if (guests) query.set("guests", guests);
      if (price) query.set("price", price);

      console.log(
        "ListingsPage: Fetching listings with query:",
        query.toString()
      );

      try {
        const res = await fetch(`/api/listings?${query}`);
        console.log("ListingsPage: /api/listings status:", res.status);
        const data = await res.json();
        console.log("ListingsPage: /api/listings data:", data);

        if (res.status === 200) {
          setListings(Array.isArray(data) ? data : []);
        } else {
          setError(data.message || "Failed to load listings");
        }
      } catch (err) {
        console.error("ListingsPage: Fetch error:", err.message);
        setError("Network error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-gray-900 text-xl" aria-live="polite">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Error</h1>
          <p className="text-red-500" role="alert">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Our Properties
          </h1>
          <p className="text-gray-600">
            {listings.length > 0
              ? `Found ${listings.length} listing${
                  listings.length > 1 ? "s" : ""
                }`
              : "No listings match your search"}
          </p>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No listings found. Try adjusting your search filters.</p>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            role="list"
          >
            {listings.map((listing) => (
              <div
                key={listing._id}
                className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden"
                role="listitem"
              >
                {/* Image */}
                {listing.image && (
                  <div className="relative w-full h-48 cursor-pointer">
                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover hover:opacity-90 transition-opacity"
                      onClick={() => router.push(`/listings/${listing._id}`)}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={listing === listings[0]} // Preload first image for better LCP
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {listing.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <MapPin
                      className="w-4 h-4 text-gray-400"
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="truncate">{listing.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm mb-3">
                    <Star
                      className="w-4 h-4 text-yellow-400 fill-current"
                      alt=""
                      aria-hidden="true"
                    />
                    <span className="font-medium">
                      {listing.rating || "N/A"}
                    </span>
                    <span className="text-gray-500">
                      ({listing.reviews || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{listing.price}{" "}
                      <span className="text-sm font-normal text-gray-500">
                        / night
                      </span>
                    </span>
                    <Link
                      href={`/listings/${listing._id}`}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<ListingsPageFallback />}>
      <ListingsContent />
    </Suspense>
  );
}
