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

// Endpoint to generate 4 questions
app.post("/generate-questions", async (req, res) => {
  try {
    const { field } = req.body;
    if (!field) {
      return res.status(400).json({ error: "Business field is required" });
    }

    const prompt = `
    You are an AI assistant. Generate 4 insightful and specific questions for a business owner in the field of "${field}".
    Focus on important areas such as strategy, marketing, finance, customer retention, or operations.

    Return only the questions in a JSON array like:
    {
      "questions": ["Question 1", "Question 2", "Question 3", "Question 4"]
    }
    `;

    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON response from AI");

    const data = JSON.parse(match[0]);

    res.json({ questions: data.questions });
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
You are an AI business evaluator. Assess the following 4 answers from someone building a business in the field of "${field}".
For each answer, provide:
- A score out of 10
- Short, actionable feedback

Also provide:
- A final overall rating (out of 10)
- A step-by-step roadmap with 3 to 5 action items to improve or grow the business.

Answers:
${answers.map((ans, i) => `Q${i + 1}: ${ans}`).join("\n")}

Return JSON only, in this exact format:
{
  "scores": [score1, score2, score3, score4],
  "feedback": ["feedback1", "feedback2", "feedback3", "feedback4"],
  "final_rating": overall_score,
  "roadmap": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."]
}
`;

    const response = await model.generateContent(prompt);
    let text = response.response.text().trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON response from AI");

    const evaluation = JSON.parse(match[0]);

    res.json(evaluation);
  } catch (error) {
    console.error("Error evaluating answers:", error);
    res.status(500).json({ error: "Failed to evaluate answers" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
