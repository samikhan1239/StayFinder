"use client";
import PropertyForm from "../../../components/PropertyForm";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function CreateListing() {
  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Listing
          </h1>
          <p className="text-lg text-gray-600">
            Add a new property to share with travelers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <PropertyForm />
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Listing Preview
                </h3>
                <p className="text-sm text-gray-500">
                  Your listing will appear like this to guests
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
