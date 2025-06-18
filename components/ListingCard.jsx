import Link from "next/link";
import Image from "next/image";

export default function ListingCard({ listing }) {
  return (
    <Link href={`/listings/${listing._id}`}>
      <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
        <Image
          src={listing.image}
          alt={listing.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{listing.title}</h3>
          <p className="text-gray-600">{listing.location}</p>
          <p className="text-primary font-semibold">₹{listing.price}/night</p>
        </div>
      </div>
    </Link>
  );
}
