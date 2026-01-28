
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

async function main() {
  const db = getDb();
  const email = "msm.jur@gmail.com";
  console.log(`Updating ${email} to admin...`);
  
  const result = await db
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.email, email))
    .returning();
    
  console.log("Updated users:", result);
  process.exit(0);
}

main().catch(console.error);
