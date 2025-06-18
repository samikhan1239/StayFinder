import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export default function CallToActionSection() {
  return (
    <section className="py-24 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="animate-[float_3s_ease-in-out_infinite]">
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-8">
            Your Adventure
            <span className="block">Awaits</span>
          </h2>
          <p className="text-xl text-red-100 mb-12 max-w-3xl mx-auto">
            Join millions of travelers who trust us to discover extraordinary
            places, create unforgettable memories, and find their perfect home
            away from home
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center space-x-3 bg-white text-red-500 px-10 py-5 rounded-full font-bold hover:bg-red-50 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
            >
              <ArrowRight className="w-6 h-6" />
              <span>Start Exploring Now</span>
            </Link>
            <button className="inline-flex items-center space-x-3 bg-black/20 backdrop-blur-sm text-white px-10 py-5 rounded-full font-bold hover:bg-black/30 transition-all duration-300 border-2 border-white/30 text-lg">
              <Play className="w-6 h-6" />
              <span>See How It Works</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
