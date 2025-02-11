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
    return result.response.text();
  } catch (err) {
    console.error("❌ AI Error:", err);
    return "Error generating response";
  }
};

// 🔹 1️⃣ Start Interview (with difficulty selection)
router.post("/start", async (req, res) => {
  const { role, userId, difficulty } = req.body;

  if (!role || !userId || !difficulty) {
    return res.status(400).json({ error: "Role, userId, and difficulty are required" });
  }

  if (!["easy", "medium", "hard"].includes(difficulty.toLowerCase())) {
    return res.status(400).json({ error: "Invalid difficulty level" });
  }

  const difficultyPrompts = {
    easy: "Ask simple and basic questions suitable for beginners.",
    medium: "Ask intermediate-level questions that test real-world understanding.",
    hard: "Ask advanced questions that require deep expertise and critical thinking.",
  };

  const prompt = `Conduct a ${difficulty} job interview for a ${role} position. ${difficultyPrompts[difficulty]}`;

  try {
    console.log(`🔹 Generating first ${difficulty} question...`);
    const firstQuestion = await generateResponse(prompt);

    const newSession = new InterviewSession({
      userId,
      title: `Interview for ${role} (${difficulty})`,
      role,
      difficulty,
      conversationHistory: [{ question: firstQuestion, userResponse: "", timestamp: Date.now() }],
      startTime: Date.now(),
      endTime: Date.now() + 30 * 60 * 1000, // 30-minute limit
    });

    await newSession.save();

    res.json({ sessionId: newSession._id, question: firstQuestion, timeLimit: 5 * 60 * 1000 });
  } catch (err) {
    console.error("❌ Error starting interview:", err);
    res.status(500).json({ error: "Error starting interview", details: err.message });
  }
});

// 🔹 2️⃣ Process Answer & Get Next Question
router.post("/process", async (req, res) => {
  const { sessionId, answer } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (Date.now() > session.endTime) {
      session.status = "completed";
      await session.save();
      return res.json({ error: "Interview time is over. Please review your answers." });
    }

    // Generate feedback based on difficulty level
    let feedback = "";
    if (answer) {
      const lastQuestion = session.conversationHistory[session.conversationHistory.length - 1].question;
      const feedbackPrompt = `Evaluate this answer for a ${session.role} interview question (Difficulty: ${session.difficulty}).
      Question: "${lastQuestion}". Answer: "${answer}". Provide detailed feedback accordingly.`;

      feedback = await generateResponse(feedbackPrompt);
    }

    // Generate next question based on difficulty
    const nextQuestionPrompt = `Ask the next interview question for a ${session.role} role (Difficulty: ${session.difficulty}).`;
    const nextQuestion = await generateResponse(nextQuestionPrompt);

    session.conversationHistory.push({
      question: nextQuestion,
      userResponse: answer,
      feedback,
      timestamp: Date.now(),
    });

    await session.save();

    res.json({ feedback, nextQuestion, timeLimit: 5 * 60 * 1000 });
  } catch (err) {
    console.error("❌ Error processing answer:", err);
    res.status(500).json({ error: "Error processing answer", details: err.message });
  }
});

// 🔹 3️⃣ Skip Question
router.post("/skip", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    if (Date.now() > session.endTime) {
      session.status = "completed";
      await session.save();
      return res.json({ error: "Interview time is over. Please review your answers." });
    }

    const nextQuestionPrompt = `Ask the next interview question for a ${session.role} role (Difficulty: ${session.difficulty}).`;
    const nextQuestion = await generateResponse(nextQuestionPrompt);

    session.conversationHistory.push({
      question: nextQuestion,
      userResponse: "Skipped",
      timestamp: Date.now(),
    });

    await session.save();

    res.json({ nextQuestion, timeLimit: 5 * 60 * 1000 });
  } catch (err) {
    console.error("❌ Error skipping question:", err);
    res.status(500).json({ error: "Error skipping question", details: err.message });
  }
});

// 🔹 4️⃣ End Interview & Provide Summary
router.post("/end", async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Session ID is required" });
  }

  try {
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const summaryPrompt = `Provide a final evaluation for this interview (Difficulty: ${session.difficulty}) based on these responses: ${session.conversationHistory.map(entry => `"${entry.userResponse}"`).join(" | ")}`;

    const summary = await generateResponse(summaryPrompt);

    session.status = "completed";
    await session.save();

    res.json({ summary });
  } catch (err) {
    console.error("❌ Error summarizing interview:", err);
    res.status(500).json({ error: "Error summarizing interview", details: err.message });
  }
});

module.exports = router;
