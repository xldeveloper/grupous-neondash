
import { invokeLLM } from "./server/_core/llm";

async function testLLM() {
  console.log("Testing LLM integration...");
  try {
    const result = await invokeLLM({
      messages: [
        { role: "user", content: "Who are you?" }
      ]
    });
    console.log("LLM Response Success:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error("LLM Test Failed:");
    console.error(error.message);
  }
}

testLLM();
