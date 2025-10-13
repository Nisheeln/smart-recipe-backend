// routes/recipeRoutes.js
const express = require("express");
const { OpenAI } = require("openai");
const auth = require("../middleware/auth"); // to identify logged-in user (optional)
const User = require("../models/User"); // if you store ratings per user

const router = express.Router();

// 🧠 Generate Recipes using OpenAI
router.post("/", async (req, res) => {
  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { ingredients, difficulty, time, dietaryPreference } = req.body;

    if (!ingredients || ingredients.length === 0)
      return res.status(400).json({ error: "Ingredients are required" });

    const prompt = `
Generate 10 unique recipes with:
- Ingredients: ${ingredients.join(", ")}
- Difficulty: ${difficulty || "Medium"}
- Cooking time: ${time || 30} minutes
- Dietary: ${dietaryPreference || "any"}

Return strict JSON:
{
  "recipes": [
    {
      "title": "string",
      "cuisine": "string",
      "difficulty": "string",
      "cook_time": number,
      "ingredients": ["ingredient1", "ingredient2"],
      "steps": ["step1", "step2"],
      "nutrition": { "calories": number, "protein": number },
      "rating": number
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful recipe generator assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    const data = JSON.parse(text);
    res.json(data);
  } catch (err) {
    console.error("Error generating recipes:", err);
    res.status(500).json({ error: "Failed to generate recipes", details: err.message });
  }
});

// ⭐ Save Recipe Rating
router.post("/rate/:title", auth, async (req, res) => {
  try {
    const { title } = req.params;
    const { rating } = req.body;
    const userId = req.user.id; // from token via middleware

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Ensure `user.ratedRecipes` array exists in schema
    if (!user.ratedRecipes) user.ratedRecipes = [];

    const existing = user.ratedRecipes.find(r => r.title === title);

    if (existing) {
      existing.rating = rating; // update old rating
    } else {
      user.ratedRecipes.push({ title, rating });
    }

    await user.save();
    res.json({ message: "Rating saved successfully", ratedRecipes: user.ratedRecipes });
  } catch (err) {
    console.error("Error saving rating:", err);
    res.status(500).json({ error: "Failed to save rating", details: err.message });
  }
});

module.exports = router;
