const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, required: true }, // Selected role (e.g., Frontend Developer)
  questions: [{ question: String, userAnswer: String, feedback: String }],
}, { timestamps: true });

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);
