const express = require("express");
const router = express.Router();

const User = require("../models/user")

// 🔹 User Registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Password " ,password);
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ user:newUser,message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔹 User Login - Return userId for tracking
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (password !== user.password) {
      return res.status(400).json({ message: "Please correct your password. Invalid credentials" });
    }
    res.status(200).json({user:user , message: "Login successful", userId: user._id, name: user.name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// 🔹 Update User Profile
router.put("/update/:id", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = { name, email };

    // Hash new password if provided
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
