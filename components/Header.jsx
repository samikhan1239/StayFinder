"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "../utils/api";
import { Home, Menu, X, User } from "lucide-react";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(
      "Header: Token:",
      token ? token.substring(0, 20) + "..." : "No token"
    );
    if (token) {
      fetchWithAuth("/api/auth/me")
        .then(async (response) => {
          const data = await response.json();
          console.log("Header: /api/auth/me data:", data);
          if (response.ok) {
            setUser(data);
          } else {
            console.log("Header: /api/auth/me failed:", data.message);
            localStorage.removeItem("token");
            setUser(null);
          }
        })
        .catch((err) => {
          console.error("Header: Fetch user error:", err.message);
          localStorage.removeItem("token");
          setUser(null);
        });
    }
  }, []);

  const handleLogout = () => {
    console.log("Header: Logging out");
    localStorage.removeItem("token");
    setUser(null);
    router.push("/login");
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg py-2" : "bg-transparent py-4"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold transition-colors ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              StayFinder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`font-medium transition-colors hover:text-red-500 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              Home
            </Link>
            <Link
              href="/listings"
              className={`font-medium transition-colors hover:text-red-500 ${
                isScrolled ? "text-gray-700" : "text-white"
              }`}
            >
              Explore
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`font-medium transition-colors hover:text-red-500 ${
                  isScrolled ? "text-gray-700" : "text-white"
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProfileDropdownOpen(!isProfileDropdownOpen)
                  }
                  className="flex items-center border border-gray-300 rounded-full p-2 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-500"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-red-500"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/register"
                className={`font-medium transition-colors hover:text-red-500 ${
                  isScrolled ? "text-gray-700" : "text-white"
                }`}
              >
                Sign Up
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mt-4 py-4 bg-white rounded-lg shadow-lg md:hidden">
            <div className="flex flex-col space-y-4 px-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-red-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/listings"
                className="text-gray-700 hover:text-red-500 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-gray-700 hover:text-red-500 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="text-gray-700 hover:text-red-500 font-medium text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/register"
                  className="text-gray-700 hover:text-red-500 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
