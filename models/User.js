import { MongoClient } from "mongodb";

export async function createUserModel(db) {
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
}
