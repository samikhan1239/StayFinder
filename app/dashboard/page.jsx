"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchWithAuth } from "../../utils/api";
import { User, Home, Plus, Calendar, Shield, MapPin, Star } from "lucide-react";
import Sidebar from "../../components/Sidebar";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard: Initializing useEffect");
    const token = localStorage.getItem("token");
    console.log(
      "Dashboard: Token:",
      token ? token.substring(0, 20) + "..." : "No token"
    );

    if (!token) {
      console.log("Dashboard: No token found, redirecting to /login");
      router.push("/login");
      return;
    }

    // Fetch user data
    console.log("Dashboard: Fetching /api/auth/me");
    fetchWithAuth("/api/auth/me")
      .then((res) => {
        console.log("Dashboard: /api/auth/me response status:", res.status);
        return res.json().then((data) => ({ res, data }));
      })
      .then(({ res, data }) => {
        console.log("Dashboard: /api/auth/me data:", data);
        if (res.ok) {
          setUser(data);
        } else {
          console.log("Dashboard: Invalid response, clearing token");
          localStorage.removeItem("token");
          setError(data.message || "Failed to authenticate");
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("Dashboard: Fetch error:", err.message);
        localStorage.removeItem("token");
        setError("Network error occurred");
        router.push("/login");
      });
  }, [router]);

  useEffect(() => {
    if (!user) return;

    // Fetch user's recent listings
    console.log("Dashboard: Fetching user listings for hostId:", user._id);
    fetchWithAuth(`/api/listings?hostId=${user._id}`)
      .then((res) => {
        console.log("Dashboard: /api/listings response status:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("Dashboard: /api/listings data:", data);
        setListings(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((err) => {
        console.error("Dashboard: Listings fetch error:", err.message);
      });
  }, [user]);

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
      <Sidebar activeRoute="/dashboard" />

      {/* Main Content */}
      <div className="flex-1 pt-24 pl-0 lg:pl-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-lg text-gray-600">
              Manage your properties and bookings with ease
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Stats */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Stats
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {listings.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">0</p>
                    <p className="text-sm text-gray-600">Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₹0</p>
                    <p className="text-sm text-gray-600">Earnings</p>
                  </div>
                </div>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Link
                  href="/dashboard/create-listing"
                  className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 p-3 rounded-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Create New Listing
                    </h3>
                    <p className="text-sm text-gray-600">
                      Add a new property to your portfolio
                    </p>
                  </div>
                </Link>
                <Link
                  href="/dashboard/my-listings"
                  className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-lg">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      My Listings
                    </h3>
                    <p className="text-sm text-gray-600">
                      View and manage your properties
                    </p>
                  </div>
                </Link>
              </div>

              {/* Recent Listings */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Recent Listings
                  </h3>
                  {listings.length > 0 && (
                    <Link
                      href="/dashboard/my-listings"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View All
                    </Link>
                  )}
                </div>
                {listings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No listings yet. Create your first property!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {listings.map((listing) => (
                      <Link
                        key={listing._id}
                        href={`/listings/${listing._id}`}
                        className="flex space-x-4 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        {listing.image && (
                          <div className="relative w-20 h-20">
                            <Image
                              src={listing.image}
                              alt={listing.title}
                              fill
                              className="object-cover rounded-lg"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {listing.title}
                          </h4>
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
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Activity (Placeholder) */}
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span>No recent bookings or updates</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Check back later for updates on your listings and bookings!
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative w-16 h-16">
                      <Image
                        src={
                          user.avatar ||
                          "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200"
                        }
                        alt={user.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>{user.joinDate || "Joined recently"}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Host Account</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      localStorage.removeItem("token");
                      router.push("/login");
                    }}
                    className="w-full mt-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
