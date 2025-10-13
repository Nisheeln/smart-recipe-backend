const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth"); // JWT auth middleware

// ✅ Add recipe to favorites
router.post("/add", auth, async (req, res) => {
  try {
    const { recipe } = req.body;
    const userId = req.user.id;

    if (!recipe || !recipe.title) {
      return res.status(400).json({ error: "Recipe data is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // check if already exists
    const exists = user.favorites.some(fav => fav.title === recipe.title);
    if (exists) {
      return res.status(400).json({ error: "Recipe already in favorites" });
    }

    // push recipe with default rating 0
    user.favorites.push({ ...recipe, rating: 0 });
    await user.save();

    res.status(201).json({ message: "Recipe added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Remove recipe from favorites
router.delete("/remove/:title", auth, async (req, res) => {
  try {
    const { title } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.favorites = user.favorites.filter(fav => fav.title !== title);
    await user.save();

    res.status(200).json({ message: "Recipe removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Get all favorites for user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ favorites: user.favorites });
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Rate a recipe (update rating)
router.post("/rate", auth, async (req, res) => {
  try {
    const { title, rating } = req.body;
    const userId = req.user.id;

    if (!title || rating == null) {
      return res.status(400).json({ error: "Title and rating are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // find the recipe in favorites
    const recipe = user.favorites.find(fav => fav.title === title);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found in favorites" });
    }

    // update the rating
    recipe.rating = rating;
    await user.save();

    res.status(200).json({ message: "Rating updated", favorites: user.favorites });
  } catch (err) {
    console.error("Error updating rating:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
