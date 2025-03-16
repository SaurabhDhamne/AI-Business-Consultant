require('dotenv').config(); // If you're using a .env file

const { OpenAI } = require("openai");

async function testApiKey() {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // Get key from environment

  try {
    const response = await openai.completions.create({ // Use a simple API call
      model: "gpt-3.5-turbo", // Or any model you have access to
      prompt: "Say hello!", // Simple prompt
      max_tokens: 5, // Keep it short
    });

    console.log("API Key is working!");
    console.log("Response:", response.choices[0].text); // Print the response (optional)
  } catch (error) {
    console.error("API Key Error:", error);
    if (error.response) { // Check for error details
        console.error("Error Details:", error.response.data);
    }
  }
}

testApiKey();