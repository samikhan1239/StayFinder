import { Heart } from "lucide-react";
import Image from "next/image"; // Import Image component

export default function FeaturedDestinationsSection() {
  const featuredDestinations = [
    {
      id: 1,
      name: "Paris, France",
      image:
        "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800",
      properties: "2,000+ stays",
      description: "City of lights and romance",
    },
    {
      id: 2,
      name: "Tokyo, Japan",
      image:
        "https://images.pexels.com/photos/248195/pexels-photo-248195.jpeg?auto=compress&cs=tinysrgb&w=800",
      properties: "1,500+ stays",
      description: "Modern culture meets tradition",
    },
    {
      id: 3,
      name: "New York, USA",
      image:
        "https://images.pexels.com/photos/290386/pexels-photo-290386.jpeg?auto=compress&cs=tinysrgb&w=800",
      properties: "3,000+ stays",
      description: "The city that never sleeps",
    },
    {
      id: 4,
      name: "London, UK",
      image:
        "https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800",
      properties: "2,500+ stays",
      description: "Historic charm and modern luxury",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Trending Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Popular places our guests love to explore, handpicked for
            unforgettable experiences
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredDestinations.map((destination, index) => (
            <div
              key={destination.id}
              className="group animate-[fadeInUp_0.5s_ease-out]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden rounded-3xl mb-6 aspect-[4/5]">
                <Image
                  src={destination.image}
                  alt={destination.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {destination.name}
                  </h3>
                  <p className="text-sm opacity-90 mb-1">
                    {destination.description}
                  </p>
                  <p className="text-sm font-medium">
                    {destination.properties}
                  </p>
                </div>
                <div className="absolute top-6 right-6">
                  <button className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
