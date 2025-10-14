// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const vision = require("@google-cloud/vision");
const pino = require("pino");

// ------------------- Logger Setup -------------------
const logger = pino({
  transport: {
    target: "pino-pretty",
    options: { colorize: true, translateTime: "SYS:standard" },
  },
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
});

// ------------------- Config -------------------
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ------------------- MongoDB Connection -------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("✅ MongoDB connected"))
  .catch((err) => logger.error("❌ MongoDB connection error:", err));

// ------------------- Routes -------------------
const signupRoute = require("./api/auth/signup");
const loginRoute = require("./api/auth/login");
const recipesRoute = require("./api/recipes");
const detectIngredientRoute = require("./api/dectect-ingredient");
const favoritesRoute = require("./api/favorites");

app.use("/api/auth/signup", signupRoute);
app.use("/api/auth/login", loginRoute);
app.use("/api/recipes", recipesRoute);
app.use("/api/detect-ingredient", detectIngredientRoute);
app.use("/api/favorites", favoritesRoute);

// ------------------- Health Route -------------------
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
  logger.info("💓 Health check ping received");
});

// ------------------- Start Server -------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`✅ Backend running on port ${PORT}`);
});

// ------------------- Uncaught Error Handling -------------------
process.on("uncaughtException", (err) => {
  logger.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("💥 Unhandled Rejection:", reason);
});
