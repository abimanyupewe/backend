import express from "express";
import connectDB from "./config/mongodb.js";
import "dotenv/config.js"; // Load environment variables
import connectCloudinary from "./config/cloudinary.js";

// app config
const app = express();
const port = process.env.PORT || 4000; // port setting

connectDB(); // connect to MongoDB
connectCloudinary(); // connect to cloudinary

app.get("/", (req, res) => {
  res.send("Welcome to Florera API!");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
