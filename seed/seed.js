const { connectToDatabase } = require("../lib/db");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

async function seedDatabase() {
  const { db } = await connectToDatabase();

  await db.collection("users").deleteMany({});
  await db.collection("listings").deleteMany({});
  await db.collection("bookings").deleteMany({});

  const hashedPassword = await bcrypt.hash("password123", 8);
  const users = [
    {
      name: "Sami Khan",
      email: "sami123@gmail.com",
      password: sami123,
      createdAt: new Date(),
    },
  ];
  const insertedUsers = await db.collection("users").insertMany(users);

  const listings = [
    {
      title: "Cozy Beach House",
      description: "A beautiful beach house with ocean views.",
      location: "Goa",
      price: 2999,
      image: "https://images.unsplash.com/photo-1499796556596-a0e59355f159",
      hostId: new ObjectId(insertedUsers.insertedIds[0]),
      createdAt: new Date(),
    },
    {
      title: "Mountain Cabin",
      description: "A serene cabin in the mountains.",
      location: "Manali",
      price: 1999,
      image: "https://images.unsplash.com/photo-1505692952047-7750a3e5",
      hostId: new ObjectId(insertedUsers.insertedIds[1]),
      createdAt: new Date(),
    },
  ];
  await db.collection("listings").insertMany(listings);

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Error seeding database:", err);
  process.exit(1);
});
