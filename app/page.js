import Link from "next/link";
import HeroSlider from "../components/HeroSlider";

import { connectToDatabase } from "../lib/db";
import SearchBar from "@/components/SearchBar";
import StatsSection from "@/components/StatsSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedDestinationsSection from "@/components/FeaturedDestinationSection";
import CallToActionSection from "@/components/CallToActionSection";
import ListingsSection from "@/components/ListingsSection";

export default async function Home() {
  const { db } = await connectToDatabase();
  const listings = await db.collection("listings").find({}).limit(6).toArray();

  return (
    <div className="overflow-hidden">
      <HeroSlider />
      <div className="relative z-20 -mt-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SearchBar />
      </div>
      <StatsSection />
      <CategoriesSection />
      <FeaturedDestinationsSection />
      <ListingsSection listings={listings} />
      <CallToActionSection />
    </div>
  );
}
