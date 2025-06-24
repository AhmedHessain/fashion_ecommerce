"use server";
import mongoose from "mongoose";
const MONGO_DB_URL = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

if (!MONGO_DB_URL) {
  throw new Error(
    "Please define the MONGO_DB_URL environment variable inside .env.local"
  );
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose.connect(MONGO_DB_URL, opts).then((mongoose) => {
      require("../model/reviewModel");
      console.log("Db connected");
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
