"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ItineraryPlanner({ location, listingId }) {
  const [preferences, setPreferences] = useState({
    interests: [],
    dining: [],
    duration: 1,
  });
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!location || !listingId) {
      setError("Missing location or listing ID");
      toast.error("Invalid listing data");
      setLoading(false);
      return;
    }

    if (preferences.interests.length === 0 || preferences.dining.length === 0) {
      setError("Please select at least one interest and dining preference");
      toast.error("Please select at least one interest and dining preference");
      setLoading(false);
      return;
    }

    try {
      console.log("ItineraryPlanner: Sending request:", {
        location,
        preferences,
        listingId,
      });
      const res = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, preferences, listingId }),
      });
      const data = await res.json();
      console.log("ItineraryPlanner: Response:", data);
      if (res.ok) {
        setItinerary(data.itinerary);
        toast.success("Itinerary generated!");
      } else if (res.status === 429) {
        setError(
          "Rate limit exceeded, please try again later or contact support"
        );
        toast.error("Rate limit exceeded, please try again later");
      } else if (res.status === 401) {
        setError("Invalid API configuration, please contact support");
        toast.error("Invalid API configuration");
      } else {
        setError(data.message || "Failed to generate itinerary");
        toast.error(data.message || "Failed to generate itinerary");
      }
    } catch (error) {
      console.error("ItineraryPlanner: Error:", error.message, error.stack);
      setError("Network error occurred, please try again");
      toast.error("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
        Plan Your Trip
      </h3>
      {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-gray-700 mb-2 text-sm sm:text-base">
            Interests
          </label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {["relaxation", "adventure", "history", "culture"].map(
              (interest) => (
                <label key={interest} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={interest}
                    checked={preferences.interests.includes(interest)}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPreferences((prev) => ({
                        ...prev,
                        interests: prev.interests.includes(value)
                          ? prev.interests.filter((i) => i !== value)
                          : [...prev.interests, value],
                      }));
                    }}
                    className="h-4 w-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm sm:text-base capitalize">
                    {interest}
                  </span>
                </label>
              )
            )}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-sm sm:text-base">
            Dining Preferences
          </label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {["fine dining", "seafood", "local cuisine"].map((dining) => (
              <label key={dining} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={dining}
                  checked={preferences.dining.includes(dining)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPreferences((prev) => ({
                      ...prev,
                      dining: prev.dining.includes(value)
                        ? prev.dining.filter((i) => i !== value)
                        : [...prev.dining, value],
                    }));
                  }}
                  className="h-4 w-4 text-red-500 focus:ring-red-500"
                />
                <span className="text-sm sm:text-base capitalize">
                  {dining}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-sm sm:text-base">
            Trip Duration (days)
          </label>
          <input
            type="number"
            min="1"
            max="7"
            value={preferences.duration}
            onChange={(e) =>
              setPreferences({
                ...preferences,
                duration: Number(e.target.value),
              })
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-red-500 text-white px-4 sm:px-6 py-2 rounded-md hover:bg-red-600 transition-all duration-200 text-sm sm:text-base ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
      </form>
      {itinerary && (
        <div className="mt-6 space-y-4 sm:space-y-6">
          <h4 className="text-base sm:text-lg font-semibold text-gray-900">
            Your Personalized Itinerary
          </h4>
          {itinerary.map((day) => (
            <div key={day.day} className="border-t border-gray-200 pt-4">
              <h5 className="text-sm sm:text-base font-medium text-gray-900">
                {day.day}
              </h5>
              <ul className="mt-2 space-y-2 sm:space-y-3">
                {day.schedule.map((item, index) => (
                  <li
                    key={index}
                    className="text-sm sm:text-base text-gray-700"
                  >
                    <span className="font-medium">
                      {item.time} - {item.name}
                    </span>
                    : {item.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
