const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const dotenv = require("dotenv");
dotenv.config();

router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    
    const hashedPassword = await bcrypt.hash(password, 10);

    
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    
    res.status(201).json({
      message: "User created successfully",
      token,
      name: user.name,
    });
  } catch (err) {
    console.error("Error during signup:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
