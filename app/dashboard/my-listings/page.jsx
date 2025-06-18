"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchWithAuth } from "../../../utils/api";
import {
  Home,
  MapPin,
  Star,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import toast from "react-hot-toast";

export default function MyListings() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null); // Track listing being deleted
  const router = useRouter();

  useEffect(() => {
    console.log("MyListings: Initializing useEffect");
    const token = localStorage.getItem("token");
    console.log(
      "MyListings: Token:",
      token ? token.substring(0, 20) + "..." : "No token"
    );

    if (!token) {
      console.log("MyListings: No token found, redirecting to /login");
      router.push("/login");
      return;
    }

    // Fetch user data
    console.log("MyListings: Fetching /api/auth/me");
    fetchWithAuth("/api/auth/me")
      .then((res) => {
        console.log("MyListings: /api/auth/me response status:", res.status);
        return res.json().then((data) => ({ res, data }));
      })
      .then(({ res, data }) => {
        console.log("MyListings: /api/auth/me data:", data);
        if (res.ok) {
          setUser(data);
        } else {
          console.log("MyListings: Invalid response, clearing token");
          localStorage.removeItem("token");
          setError(data.message || "Failed to authenticate");
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("MyListings: Fetch error:", err.message);
        localStorage.removeItem("token");
        setError("Network error occurred");
        router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Fetch all user listings
    console.log("MyListings: Fetching user listings for hostId:", user._id);
    fetchWithAuth(`/api/listings?hostId=${user._id}`)
      .then((res) => {
        console.log("MyListings: /api/listings response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("MyListings: /api/listings data:", data);
        const userListings = Array.isArray(data) ? data : [];
        setListings(userListings);
        setFilteredListings(userListings);
      })
      .catch((err) => {
        console.error("MyListings: Listings fetch error:", err.message);
        toast.error("Failed to load listings");
      });
  }, [user]);

  // Handle search/filter
  useEffect(() => {
    const filtered = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredListings(filtered);
  }, [searchQuery, listings]);

  // Handle delete listing
  const handleDelete = async (listingId) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setIsDeleting(listingId);

    try {
      console.log("MyListings: Deleting listing ID:", listingId);
      const res = await fetchWithAuth(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      console.log("MyListings: Delete response status:", res.status);
      if (res.ok) {
        setListings(listings.filter((listing) => listing._id !== listingId));
        setFilteredListings(
          filteredListings.filter((listing) => listing._id !== listingId)
        );
        toast.success("Listing deleted successfully");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to delete listing");
      }
    } catch (err) {
      console.error("MyListings: Delete error:", err.message);
      toast.error("Failed to delete listing");
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle toggle status (Active/Draft)
  const handleToggleStatus = async (listingId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Draft" : "Active";
    try {
      console.log(
        "MyListings: Toggling status for listing ID:",
        listingId,
        "to",
        newStatus
      );
      const res = await fetchWithAuth(`/api/listings/${listingId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      console.log("MyListings: Toggle status response status:", res.status);
      if (res.ok) {
        setListings(
          listings.map((listing) =>
            listing._id === listingId
              ? { ...listing, status: newStatus }
              : listing
          )
        );
        setFilteredListings(
          filteredListings.map((listing) =>
            listing._id === listingId
              ? { ...listing, status: newStatus }
              : listing
          )
        );
        toast.success(`Listing set to ${newStatus}`);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("MyListings: Toggle status error:", err.message);
      toast.error("Failed to update status");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white pt-24 flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <Sidebar activeRoute="/dashboard/my-listings" />

      {/* Main Content */}
      <div className="flex-1 pt-24 pl-0 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Listings
            </h1>
            <p className="text-lg text-gray-600">
              View and manage all your properties
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Listings */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            {filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-500">
                  No listings found.{" "}
                  <Link
                    href="/dashboard/create-listing"
                    className="text-blue-600 hover:underline"
                  >
                    Create your first property!
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredListings.map((listing) => (
                  <div
                    key={listing._id}
                    className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {listing.image && (
                      <div className="relative w-24 h-24">
                        <Image
                          src={listing.image}
                          alt={listing.title}
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/listings/${listing._id}`}
                          className="text-sm font-medium text-gray-900 truncate hover:underline"
                        >
                          {listing.title}
                        </Link>
                        <span
                          className={`text-xs px-2 py-1 rounded-full cursor-pointer ${
                            listing.status === "Active"
                              ? "bg-green-100 text-green-600"
                              : "bg-yellow-100 text-yellow-600"
                          }`}
                          onClick={() =>
                            handleToggleStatus(listing._id, listing.status)
                          }
                        >
                          {listing.status || "Active"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span>{listing.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>
                          {listing.rating || "N/A"} ({listing.reviews || 0})
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        ₹{listing.price}/night
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Listing"
                        disabled={isDeleting === listing._id}
                      >
                        <Trash2
                          className={`w-5 h-5 ${
                            isDeleting === listing._id ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
