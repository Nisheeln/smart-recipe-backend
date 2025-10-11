// server.js

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const { OpenAI } = require("openai");
const vision = require("@google-cloud/vision");

// Route imports
const signupRoute = require("./api/auth/signup");
const loginRoute = require("./api/auth/login");
const recipesRoute = require("./api/recipes");
const detectIngredientRoute = require("./api/dectect-ingredient")


const app = express();
app.use(cors());
app.use(express.json());

// ------------------- MongoDB Connection -------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ------------------- Routes -------------------
app.use("/api/auth/signup", signupRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/recipes", recipesRoute);
app.use("/api/detect-ingredient", detectIngredientRoute);

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
