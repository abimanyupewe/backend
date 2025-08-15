import express from "express";
import connectDB from "./config/mongodb.js";
import cors from "cors";
import "dotenv/config.js"; // Load environment variables
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000; // port setting

// middleware
app.use(cors());
app.use(express.json()); // parse JSON

connectDB(); // connect to MongoDB
connectCloudinary(); // connect to cloudinary

// end point API
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Welcome to Florera API!");
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
