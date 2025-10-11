const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const router = express.Router();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {});

// JWT Auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Apply auth middleware to all routes
router.use(authMiddleware);

// POST /api/favorites - add recipe
router.post("/", async (req, res) => {
  try {
    const recipe = req.body;
    const exists = req.user.favorites.find((r) => r.title === recipe.title);
    if (!exists) {
      req.user.favorites.push(recipe);
      await req.user.save();
    }
    res.json({ message: "Recipe added to favorites", favorites: req.user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// GET /api/favorites - list favorites
router.get("/", async (req, res) => {
  try {
    res.json({ favorites: req.user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// DELETE /api/favorites - remove recipe
router.delete("/", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: "Recipe title is required" });

    req.user.favorites = req.user.favorites.filter((r) => r.title !== title);
    await req.user.save();

    res.json({
      message: `Recipe '${title}' removed`,
      favorites: req.user.favorites,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

module.exports = router;
