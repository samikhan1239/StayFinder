"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Home } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Login response:", { status: res.status, data });
      if (res.ok) {
        localStorage.setItem("token", data.token);
        console.log("Token stored:", data.token.substring(0, 20) + "...");
        toast.success("Logged in successfully!");
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/dashboard");
      } else {
        toast.error(data.message || "Failed to login");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4 py-12"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80')",
      }}
    >
      <div className="w-full max-w-md bg-white/95 rounded-xl shadow-lg p-8 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <Home className="w-5 h-5 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
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
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white p-2 rounded hover:from-red-600 hover:to-pink-600 disabled:bg-gray-400 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Sign In"}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Don’t have an account?{" "}
          <a
            href="/register"
            className="text-red-500 hover:text-red-600 font-medium"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
