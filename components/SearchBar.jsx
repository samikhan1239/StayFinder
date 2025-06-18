"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [price, setPrice] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      location,
      checkIn,
      checkOut,
      price,
    }).toString();
    router.push(`/listings?${query}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-4 shadow-lg rounded-lg flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
    >
      <input
        type="text"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="p-2 border rounded w-full sm:w-auto"
      />
      <input
        type="date"
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
        className="p-2 border rounded w-full sm:w-auto"
      />
      <input
        type="date"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
        className="p-2 border rounded w-full sm:w-auto"
      />
      <input
        type="number"
        placeholder="Max Price (₹)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-2 border rounded w-full sm:w-auto"
      />
      <button
        type="submit"
        className="bg-primary text-white p-2 rounded hover:bg-primary-dark"
      >
        Search
      </button>
    </form>
  );
}
