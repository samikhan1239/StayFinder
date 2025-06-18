import { Users, MapPin, TrendingUp, Award } from "lucide-react";

export default function StatsSection() {
  const stats = [
    { number: "5M+", label: "Happy Guests", icon: Users },
    { number: "100K+", label: "Properties", icon: MapPin },
    { number: "200+", label: "Countries", icon: TrendingUp },
    { number: "4.9", label: "Average Rating", icon: Award },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-red-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center animate-[fadeInUp_0.5s_ease-out]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
