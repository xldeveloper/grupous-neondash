
import { invokeLLM } from "../server/_core/llm";

async function run() {
  console.log("Testing invokeLLM with gemini-3-flash-preview...");

  const systemPrompt = `
      You are an Elite Business Coach for aesthetics clinics (Persona: "Neon Coach").
      Your mission is to analyze the mentee's data and create 3-5 TACTICAL and IMMEDIATE tasks to boost results.

      Rules:
      1. Be direct and imperative.
      2. Focus on: Sales, Marketing (Instagram), and Management.
      3. Use a motivating but demanding tone ("Gamified").
      4. Return ONLY a JSON array of strings. Nothing else.
      Example: ["Call 10 old leads", "Post a story with a question box", "Review product costs"]
      `;

  const userContext = "Simulated test context.";

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContext },
      ],
      response_format: { type: "json_object" },
    });

    console.log("Success!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Failed!");
    console.error(error);
  }
}

run();
