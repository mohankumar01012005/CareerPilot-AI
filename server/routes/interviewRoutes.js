const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const InterviewSession = require("../models/InterviewSession");
const router = express.Router();
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// 🔹 Function to generate AI response
const generateResponse = async (prompt) => {
  try {
    console.log("🔹 Sending prompt to AI:", prompt);
    const result = await model.generateContent(prompt);
    if (!result || !result.response || !result.response.text()) {
      throw new Error("Invalid AI response");
    }
    console.log("✅ AI Response:", result.response.text());
    return result.response.text();
  } catch (err) {
    console.error("❌ AI Generation Error:", err);
    return "Error generating response";
  }
};

// 🔹 1️⃣ Get All Interviews for a User
router.get("/history/:userId", async (req, res) => {
  try {
    const interviews = await InterviewSession.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(interviews);
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ error: "Error fetching interview history" });
  }
});

// 🔹 2️⃣ Start a New Interview
router.post("/start", async (req, res) => {
  const { role, userId } = req.body;

  if (!role || !userId) {
    return res.status(400).json({ error: "Role and userId are required" });
  }

  const prompt = `Conduct a job interview for a ${role} position. Ask one question at a time. Start now.`;

  try {
    console.log("🔹 Generating first question...");
    const firstQuestion = await generateResponse(prompt);
    console.log("✅ First Question:", firstQuestion);

    const newSession = new InterviewSession({
      userId,
      title: `Interview for ${role}`,
      role,
      conversationHistory: [{ question: firstQuestion, userResponse: "" }],
    });

    console.log("🔹 Saving interview session to DB:", newSession);
    await newSession.save();
    console.log("✅ Interview session saved!");

    res.json({ sessionId: newSession._id, question: firstQuestion });
  } catch (err) {
    console.error("❌ Error starting interview:", err);
    res.status(500).json({ error: "Error starting interview", details: err.message });
  }
});

// 🔹 3️⃣ Process User Answer & Get Next Question
router.post("/process", async (req, res) => {
  const { sessionId, answer } = req.body;

  if (!sessionId || !answer) {
    return res.status(400).json({ error: "Session ID and answer are required" });
  }

  try {
    const session = await InterviewSession.findById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const lastQuestion = session.conversationHistory[session.conversationHistory.length - 1].question;

    const feedbackPrompt = `Evaluate this answer for a ${session.role} interview question: "${lastQuestion}". Answer: "${answer}". Provide feedback.`;
    const nextQuestionPrompt = `Ask the next important interview question for a ${session.role} position.`;

    const feedback = await generateResponse(feedbackPrompt);
    const nextQuestion = await generateResponse(nextQuestionPrompt);

    session.conversationHistory[session.conversationHistory.length - 1].userResponse = answer;
    session.conversationHistory[session.conversationHistory.length - 1].feedback = feedback;
    session.conversationHistory.push({ question: nextQuestion, userResponse: "" });

    await session.save();

    res.json({ feedback, nextQuestion });
  } catch (err) {
    console.error("❌ Error processing answer:", err);
    res.status(500).json({ error: "Error processing answer", details: err.message });
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

    const summaryPrompt = `Provide a detailed evaluation for this interview for a ${session.role} role based on these answers: ${session.conversationHistory.map(entry => `"${entry.userResponse}"`).join(" | ")}`;

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
