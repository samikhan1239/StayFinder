export default function CategoriesSection() {
  const categories = [
    { name: "Beach", icon: "🏖️", count: "2,500+" },
    { name: "Mountains", icon: "⛰️", count: "1,800+" },
    { name: "Cities", icon: "🏙️", count: "3,200+" },
    { name: "Countryside", icon: "🌾", count: "1,200+" },
    { name: "Desert", icon: "🏜️", count: "800+" },
    { name: "Lake", icon: "🏞️", count: "950+" },
    { name: "Tropical", icon: "🌴", count: "1,600+" },
    { name: "Arctic", icon: "🏔️", count: "400+" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Explore by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover your perfect getaway from our diverse collection of unique
            destinations around the world
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 text-center cursor-pointer border border-gray-100 hover:shadow-lg transition-all duration-300 animate-[fadeIn_0.5s_ease-out] group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{category.count} stays</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
