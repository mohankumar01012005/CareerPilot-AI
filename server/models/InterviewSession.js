const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
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
  status: { type: String, default: "ongoing" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
