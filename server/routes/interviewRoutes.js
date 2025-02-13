const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const InterviewSession = require("../models/InterviewSession");
const router = express.Router();
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 🔹 Helper Function: Generate AI Response
const generateResponse = async (prompt) => {
  try {
    console.log("🔹 AI Prompt:", prompt);
    const result = await model.generateContent(prompt);
    console.log("result: ", result.response.text());

    return result?.response?.text()?.trim() || "Line No 15 Error generating response";
  } catch (err) {
    console.error("❌ AI Error:", err);
    return "tvfgbh Error generating response";
  }
};

// 🔹 Middleware: Fetch Interview Session
const fetchSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, error: "Session ID is required" });

    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, error: "Session not found" });

    req.session = session;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching session", details: error.message });
  }
};

// 🔹 1️⃣ Start Interview
router.post("/start", async (req, res) => {
  const { role, userId, difficulty } = req.body;

  if (!role || !userId || !difficulty) {
    return res.status(400).json({ success: false, error: "Role, userId, and difficulty are required" });
  }

  const difficultyPrompts = {
    easy: "Ask 5 simple interview questions.",
    medium: "Ask 5 intermediate-level questions.",
    hard: "Ask 5 advanced questions requiring deep expertise.",
  };

  const prompt = `Generate 5 interview questions for a ${difficulty} ${role} interview. ${difficultyPrompts[difficulty]}`;

  try {
    const questionsText = await generateResponse(prompt);
    console.log("questionsText: ", questionsText);
    

    const questions = questionsText.split("\n").filter((q) => q.trim() !== "");

    if (questions.length === 0) throw new Error("No valid questions generated");

    const newSession = new InterviewSession({
      userId,
      title: `Interview for ${role} (${difficulty})`,
      role,
      difficulty,
      conversationHistory: questions.map((q) => ({ question: q, userResponse: "" })),
      startTime: new Date(),
      endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    await newSession.save();

    res.json({ success: true, sessionId: newSession._id, question: questions[0], timeLimit: 5 * 60 * 1000 });
  } catch (err) {
    res.status(500).json({ success: false, error: "Error starting interview", details: err.message });
  }
});

// 🔹 2️⃣ Process Answer & Get Next Question
router.post("/process", fetchSession, async (req, res) => {
  const { answer } = req.body;
  const session = req.session;

  if (!answer.trim()) {
    return res.status(400).json({ success: false, error: "Answer cannot be empty" });
  }

  if (Date.now() > session.endTime) {
    session.status = "completed";
    await session.save();
    return res.json({ success: false, error: "Interview time is over. Please review your answers." });
  }

  const lastQuestion = session.conversationHistory.find((q) => !q.userResponse);
  if (!lastQuestion) {
    return res.json({ success: false, error: "No more questions available" });
  }

  const feedbackPrompt = `Evaluate this answer for a ${session.role} interview (Difficulty: ${session.difficulty}). Question: "${lastQuestion.question}". Answer: "${answer}". Provide feedback in 4-5 sentences.`;
  const feedback = await generateResponse(feedbackPrompt);

  lastQuestion.userResponse = answer;
  lastQuestion.feedback = feedback;
  await session.save();

  const nextQuestion = session.conversationHistory.find((q) => !q.userResponse);

  res.json({
    success: true,
    feedback,
    nextQuestion: nextQuestion ? nextQuestion.question : "No more questions available",
  });
});

// 🔹 3️⃣ Skip Question
router.post("/skip", fetchSession, async (req, res) => {
  const session = req.session;

  if (Date.now() > session.endTime) {
    session.status = "completed";
    await session.save();
    return res.json({ success: false, error: "Interview time is over." });
  }

  const skippedQuestion = session.conversationHistory.find((q) => !q.userResponse);
  if (!skippedQuestion) return res.json({ success: false, error: "No more questions available" });

  skippedQuestion.userResponse = "Skipped";
  await session.save();

  const nextQuestion = session.conversationHistory.find((q) => !q.userResponse);

  res.json({
    success: true,
    nextQuestion: nextQuestion ? nextQuestion.question : "No more questions available",
  });
});

// 🔹 4️⃣ Fetch Interview History for a User
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, error: "User ID is required" });
    }

    const history = await InterviewSession.find({ userId }).sort({ startTime: -1 });

    if (!history.length) {
      return res.status(404).json({ success: false, error: "No interview history found" });
    }

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, error: "Error fetching history", details: error.message });
  }
});

module.exports = router;
