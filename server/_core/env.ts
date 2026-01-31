import "dotenv/config";

export const ENV = {
  clerkSecretKey: process.env.CLERK_SECRET_KEY ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // OpenAI-compatible LLM provider (optional, for AI features)
  llmApiUrl: process.env.LLM_API_URL,
  llmApiKey: process.env.LLM_API_KEY,

  // Google Calendar OAuth (optional, for calendar integration)
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUri:
    process.env.GOOGLE_REDIRECT_URI ?? "http://localhost:3000/api/calendar/callback",
};
