import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";

async function main() {
  const db = getDb();
  const email = "msm.jur@gmail.com";

  const _result = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email))
    .returning();
  process.exit(0);
}

main().catch(console.error);
