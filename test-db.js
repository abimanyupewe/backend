import mongoose from "mongoose";
import "dotenv/config";
import contentModel from "./models/contentModel.js";

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = await contentModel.find({});
  console.log(data);
  process.exit(0);
}
test();
