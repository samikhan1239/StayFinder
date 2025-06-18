"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, Plus, List, LogOut, Menu, X, Compass } from "lucide-react";

export default function Sidebar({ activeRoute }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/listings", label: "Explore", icon: Compass },
    { href: "/dashboard/create-listing", label: "Create Listing", icon: Plus },
    { href: "/dashboard/my-listings", label: "My Listings", icon: List },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50  py-20 rounded-md shadow"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-gray-800" />
        ) : (
          <Menu className="w-6 h-6 text-gray-800" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-100 py-20"></div>

          {/* Navigation */}
          <nav className="flex-1  px-4  space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  activeRoute === item.href
                    ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                handleSignOut();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 p-3 w-full text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
