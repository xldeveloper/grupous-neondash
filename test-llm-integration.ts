#!/usr/bin/env bun
/**
 * Test script to verify the Google Gemini LLM integration.
 * This script checks:
 * 1. Whether the GEMINI_API_KEY environment variable is configured
 * 2. Whether the connection to the Gemini API is working
 * 3. Whether the gemini-3-flash-preview model is accessible
 *
 * Run with: bun run test-llm-integration.ts
 */

import { testLLMConnection, validateLLMConfig } from "./server/_core/llm";

console.log("===================================================");
console.log("🧪 GOOGLE GEMINI LLM INTEGRATION TEST");
console.log("===================================================\n");

// Step 1: Validate configuration
console.log("📋 Step 1: Validating configuration...\n");
const config = validateLLMConfig();

console.log("✅ Configuration:");
console.log(`   Provider: ${config.provider}`);
console.log(`   Model: ${config.model}`);
console.log(`   Valid: ${config.isValid ? "✅ YES" : "❌ NO"}`);

if (config.errors.length > 0) {
  console.log("\n❌ Errors found:");
  config.errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });
}

console.log("\n---------------------------------------------------\n");

// Step 2: Test connection
console.log("📡 Step 2: Testing API connection...\n");

testLLMConnection()
  .then((result) => {
    console.log("✅ Test result:");
    console.log(`   Success: ${result.success ? "✅ YES" : "❌ NO"}`);
    console.log(`   Message: ${result.message}`);

    if (result.details) {
      console.log("\n📊 Details:");
      console.log(`   ${JSON.stringify(result.details, null, 2)}`);
    }

    console.log("\n===================================================");

    if (result.success) {
      console.log("🎉 INTEGRATION WORKING CORRECTLY!");
      process.exit(0);
    } else {
      console.log("❌ INTEGRATION HAS ISSUES");
      console.log("\n💡 Troubleshooting tips:");
      console.log("   1. Check that GEMINI_API_KEY is set in .env");
      console.log("   2. Get a key at: https://aistudio.google.com/app/apikey");
      console.log("   3. Restart the server after setting the key");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("\n❌ Unexpected error during test:");
    console.error(error);
    process.exit(1);
  });
