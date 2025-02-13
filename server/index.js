const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes.js");
const interviewRoutes = require("./routes/interviewRoutes.js");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
    });

// Use Routes
app.use("/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);

// Default Route
app.get("/", (req, res) => {
    res.send("CareerPilot-AI Backend is Running...");
});

// Server Cleanup on Exit
process.on("SIGINT", async () => {
    console.log("🔻 Closing MongoDB connection...");
    await mongoose.connection.close();
    process.exit(0);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
