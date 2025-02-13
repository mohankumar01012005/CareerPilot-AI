const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Changed to ObjectId
  title: { type: String, required: true },
  role: { type: String, required: true },
  difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
  conversationHistory: [
    {
      question: String,
      userResponse: String,
      feedback: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  timeLimitPerQuestion: { type: Number, default: 5 * 60 * 1000 }, // 5 minutes per question
  status: { type: String, enum: ["ongoing", "completed", "cancelled"], default: "ongoing" }, // Added enum
  date: { type: Date, default: Date.now },
});

// Indexing for faster queries
interviewSessionSchema.index({ userId: 1 });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
