const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  title: String,
  cuisine: String,
  difficulty: String,
  cook_time: Number,
  ingredients: [String],
  steps: [String],
  nutrition: {
    calories: Number,
    protein: Number,
  },
  rating: { type: Number, default: 0 },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favorites: [RecipeSchema],
});

module.exports = mongoose.model("User", UserSchema);
