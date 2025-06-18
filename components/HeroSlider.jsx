"use client";

import { useState, useEffect } from "react";
import { MapPin, ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import Image component

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    {
      url: "https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Luxury Villas",
      subtitle: "Experience breathtaking ocean views and premium amenities",
      location: "Santorini, Greece",
    },
    {
      url: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Mountain Retreats",
      subtitle: "Escape to serene mountain hideaways and fresh air",
      location: "Aspen, Colorado",
    },
    {
      url: "https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Tropical Paradise",
      subtitle: "Discover pristine beaches and crystal clear waters",
      location: "Maldives",
    },
    {
      url: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1920",
      title: "Urban Escapes",
      subtitle: "Modern comfort in the heart of vibrant cities",
      location: "Barcelona, Spain",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]); // Add heroImages.length to dependency array

  return (
    <section className="relative h-screen overflow-hidden">
      <div className="absolute inset-0">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <Image
              src={image.url}
              alt={image.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
          </div>
        ))}
      </div>
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            <div className="animate-[float_3s_ease-in-out_infinite]">
              <div className="mb-6">
                <span className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                  <MapPin className="w-4 h-4" />
                  <span>{heroImages[currentSlide].location}</span>
                </span>
              </div>
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                {heroImages[currentSlide].title.split(" ")[0]}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-orange-400">
                  {heroImages[currentSlide].title.split(" ").slice(1).join(" ")}
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl leading-relaxed">
                {heroImages[currentSlide].subtitle}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 animate-[fadeIn_1s_ease-in]">
              <Link
                href="/listings"
                className="group inline-flex items-center space-x-3 bg-white text-gray-900 px-10 py-5 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl text-lg"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group inline-flex items-center space-x-3 bg-black/20 backdrop-blur-sm text-white px-10 py-5 rounded-full font-semibold hover:bg-black/30 transition-all duration-300 border border-white/20 text-lg">
                <Play className="w-6 h-6" />
                <span>Watch Our Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-4">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`relative transition-all duration-300 ${
                index === currentSlide ? "scale-125" : "hover:scale-110"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              <div
                className={`w-4 h-4 rounded-full ${
                  index === currentSlide
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
              {index === currentSlide && (
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping opacity-75" />
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20">
        <div className="flex flex-col space-y-4">
          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + heroImages.length) % heroImages.length
              )
            }
            className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 text-xl font-light"
            aria-label="Previous slide"
          >
            ↑
          </button>
          <button
            onClick={
              () => setCurrentSlide((prev) => (prev + 1) % heroImages.length) // Fix: Replace stats.length with heroImages.length
            }
            className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 border border-white/20 text-xl font-light"
            aria-label="Next slide"
          >
            ↓
          </button>
        </div>
      </div>
    </section>
  );
}
