import { MongoClient } from "mongodb";

export async function createBookingModel(db) {
  // Index for faster queries on listingId and dates
  await db
    .collection("bookings")
    .createIndex({ listingId: 1, checkIn: 1, checkOut: 1 });
}
