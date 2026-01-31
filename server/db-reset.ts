import { neon } from "@neondatabase/serverless";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not found");
  }

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const sql = neon(connectionString);

  try {
    // Drop and recreate public schema
    await sql`DROP SCHEMA IF EXISTS public CASCADE`;
    await sql`CREATE SCHEMA public`;
    await sql`GRANT ALL ON SCHEMA public TO postgres`;
    await sql`GRANT ALL ON SCHEMA public TO public`;
  } catch (_error) {
    process.exit(1);
  }
}

main();
