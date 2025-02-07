const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  role: { type: String, required: true },
  conversationHistory: [
    {
      question: String,
      userResponse: String,
      feedback: String,
    },
  ],
  status: { type: String, default: "ongoing" },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
