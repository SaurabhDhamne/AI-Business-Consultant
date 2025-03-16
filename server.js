const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();

const app = express();
const PORT = 5000;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

app.use(cors());
app.use(express.json());

// Endpoint to generate exactly 4 questions
app.post("/generate-questions", async (req, res) => {
  try {
    const { field } = req.body;
    if (!field) {
      return res.status(400).json({ error: "Business field is required" });
    }

    const prompt = `
    Generate exactly 4 important and thought-provoking questions to assess someone planning to start a business in ${field}.
    Ensure the questions are diverse, covering market research, financial planning, execution strategy, and competition analysis.
    Only return the questions in plain text, one per line, no numbering or extra text.
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const questions = text.split("\n").filter((q) => q.trim().length > 0).slice(0, 4); // Limit to 4 questions

    res.json({ questions });
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Endpoint to evaluate answers
app.post("/evaluate-answers", async (req, res) => {
  try {
    const { field, answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length !== 4) {
      return res.status(400).json({ error: "Exactly 4 answers are required" });
    }

    const prompt = `
    You are an AI business evaluator. Assess the following 4 answers for someone interested in starting a business in ${field}.
    Provide a rating out of 10 for each answer, a short feedback, and a final overall rating.

    Answers:
    ${answers.map((ans, i) => `Q${i + 1}: ${ans}`).join("\n")}

    Response format (strict JSON):
    {
      "scores": [score1, score2, score3, score4],
      "feedback": ["feedback1", "feedback2", "feedback3", "feedback4"],
      "final_rating": overall_score
    }

    ONLY return valid JSON output. No extra text, explanation, or formatting.
    `;

    const response = await model.generateContent(prompt);
    let text = response.response.text().trim();

    // Extract only JSON using regex
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON response from AI");

    const evaluation = JSON.parse(match[0]); // Extract and parse JSON

    res.json(evaluation);
  } catch (error) {
    console.error("Error evaluating answers:", error);
    res.status(500).json({ error: "Failed to evaluate answers" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
