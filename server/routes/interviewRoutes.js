const express = require("express");
const router = express.Router();
const InterviewSession = require("../models/InterviewSession");

// 🔹 Start New Interview Session
router.post("/start", async (req, res) => {
  try {
    const { userId, role } = req.body;
    const newSession = new InterviewSession({ userId, role, questions: [] });
    await newSession.save();
    res.status(201).json({ message: "Interview session started", sessionId: newSession._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 🔹 Submit Answer & Get Feedback (Placeholder for Gemini AI)
router.post("/answer", async (req, res) => {
  try {
    const { sessionId, question, userAnswer } = req.body;
    
    // Placeholder feedback
    const feedback = "Good answer! Try to be more detailed.";

    await InterviewSession.findByIdAndUpdate(sessionId, {
      $push: { questions: { question, userAnswer, feedback } }
    });

    res.status(200).json({ message: "Answer saved", feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
