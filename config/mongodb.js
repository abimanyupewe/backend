import mongoose from "mongoose";

// connect mongodb
const connectDB = async () => {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully Sir!✔");
  });
  await mongoose.connect(`${process.env.MONGODB_URI}/florera`);
};

export default connectDB;
