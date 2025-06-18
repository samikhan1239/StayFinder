"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Home } from "lucide-react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      console.log("Register response:", { status: res.status, data });
      if (res.ok) {
        toast.success("Registration successful! Please sign in.");
        router.push("/login");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <div className="w-full h-screen flex flex-col lg:flex-row">
        {/* Left Side - About StayFinder */}
        <div
          className="lg:w-1/2 h-full bg-cover bg-center hidden lg:block relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
          }}
        >
          <div className="h-full flex flex-col justify-center items-center p-8 bg-gradient-to-br from-red-500/20 to-pink-500/20">
            <div className="max-w-md text-center animate-slide-up">
              <div className="flex justify-center items-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
                  <Home className="w-6 h-6 text-red-500 animate-pulse" />
                </div>
                <h2 className="text-3xl font-extrabold text-white">
                  StayFinder
                </h2>
              </div>
              <p className="text-white text-lg leading-relaxed">
                Your gateway to unique stays. Explore handpicked homes, from
                cozy apartments to luxury villas, and book with ease for
                unforgettable adventures.
              </p>
              <button className="mt-6 bg-white text-red-500 font-medium py-2 px-6 rounded-full hover:bg-red-50 transition-colors shadow-md animate-bounce">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-1/2 w-full flex flex-col justify-center py-20 sm:p-8 bg-white">
          <div className="max-w-md w-full mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Sign Up</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-lg hover:from-red-600 hover:to-pink-600 disabled:bg-gray-400 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Sign Up"}
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-600 text-center">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>

          {/* Mobile About Section */}
          <div className="mt-6 lg:hidden bg-gray-100 p-6 rounded-lg text-center">
            <div className="flex justify-center items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Home className="w-4 h-4 text-red-500 animate-pulse" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">StayFinder</h2>
            </div>
            <p className="text-gray-700 text-sm">
              Your gateway to unique stays. Explore handpicked homes and book
              with ease.
            </p>
            <button className="mt-4 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium py-2 px-4 rounded-full hover:from-red-600 hover:to-pink-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
