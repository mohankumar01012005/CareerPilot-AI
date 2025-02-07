require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testGemini() {
  try {
    const result = await model.generateContent("Say hello");
    console.log("✅ API Response:", result.response.text());
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
  }
}

testGemini();
