"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { fetchWithAuth } from "../utils/api";
import {
  Home,
  MapPin,
  DollarSign,
  Image as ImageIcon, // Rename to avoid conflict with next/image
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Utensils,
  Waves,
  Dumbbell,
  Flame,
  Shield,
} from "lucide-react";

export default function PropertyForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
    image: "",
    amenities: [],
    details: {
      guests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const amenitiesOptions = [
    { name: "WiFi", icon: Wifi },
    { name: "Parking", icon: Car },
    { name: "Kitchen", icon: Utensils },
    { name: "Pool", icon: Waves },
    { name: "Gym", icon: Dumbbell },
    { name: "Fireplace", icon: Flame },
    { name: "Security", icon: Shield },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("details.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        details: { ...formData.details, [field]: parseInt(value) || 1 },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenity)
        ? formData.amenities.filter((a) => a !== amenity)
        : [...formData.amenities, amenity],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.price ||
      !formData.image
    ) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }
    if (isNaN(parseInt(formData.price)) || parseInt(formData.price) <= 0) {
      toast.error("Price must be a valid positive number");
      setIsLoading(false);
      return;
    }

    try {
      console.log("PropertyForm: Submitting form data:", formData);
      const res = await fetchWithAuth("/api/listings", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
        }),
      });
      const data = await res.json();
      console.log("PropertyForm: Listing creation response:", {
        status: res.status,
        data,
      });
      if (res.ok) {
        toast.success("Listing created successfully!");
        router.push("/dashboard/my-listings");
      } else {
        toast.error(data.message || "Failed to create listing");
      }
    } catch (error) {
      console.error("PropertyForm: Listing creation error:", error.message);
      toast.error("Failed to create listing");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Property Details
      </h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Title
        </label>
        <div className="relative">
          <Home
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            alt=""
          />
          <input
            type="text"
            name="title"
            placeholder="e.g., Luxury Villa with Ocean View"
            value={formData.title}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          placeholder="Describe your property..."
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-32"
          required
        />
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location
        </label>
        <div className="relative">
          <MapPin
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            alt=""
          />
          <input
            type="text"
            name="location"
            placeholder="e.g., Santorini, Greece"
            value={formData.location}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Price */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Price per Night (₹)
        </label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            alt=""
          />
          <input
            type="number"
            name="price"
            placeholder="e.g., 450"
            value={formData.price}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
            min="1"
          />
        </div>
      </div>

      {/* Image URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <div className="relative">
          <ImageIcon
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            alt="" // Add alt="" for decorative icon
          />
          <input
            type="text"
            name="image"
            placeholder="e.g., https://example.com/image.jpg"
            value={formData.image}
            onChange={handleChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amenities
        </label>
        <div className="grid grid-cols-2 gap-4">
          {amenitiesOptions.map((amenity) => (
            <label key={amenity.name} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity.name)}
                onChange={() => handleAmenityChange(amenity.name)}
                className="w-4 h-4 text-red-500 border-gray-300 rounded focus:ring-red-500"
              />
              <amenity.icon className="w-5 h-5 text-gray-600" alt="" />
              <span className="text-sm text-gray-700">{amenity.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Property Details
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Guests</label>
            <div className="relative">
              <Users
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.guests"
                value={formData.details.guests}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bedrooms</label>
            <div className="relative">
              <Bed
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.bedrooms"
                value={formData.details.bedrooms}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Beds</label>
            <div className="relative">
              <Bed
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.beds"
                value={formData.details.beds}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Bathrooms
            </label>
            <div className="relative">
              <Bath
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                alt=""
              />
              <input
                type="number"
                name="details.bathrooms"
                value={formData.details.bathrooms}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                min="1"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Listing"}
      </button>
    </form>
  );
}
