import ListingCard from "./ListingCard";

export default function ListingsSection({ listings }) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Exceptional Stays
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Handpicked properties that offer extraordinary experiences
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <div
              key={listing._id.toString()}
              className="animate-[fadeIn_0.5s_ease-out]"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
