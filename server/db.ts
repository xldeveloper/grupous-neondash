import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { InsertUser, users } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByClerkId(clerkId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserFromClerk(clerkUserId: string, clerkUser?: any) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return null;
  }

  try {
    const values: InsertUser = {
      clerkId: clerkUserId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? null,
      name: clerkUser?.fullName ?? clerkUser?.firstName ?? null,
      loginMethod: clerkUser?.externalAccounts?.[0]?.provider ?? "email",
      lastSignedIn: new Date(),
    };

    // Check if user should be admin
    const adminEmails = ["msm.jur@gmail.com"]; // Configure admin emails
    if (values.email && adminEmails.includes(values.email)) {
      values.role = "admin";
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email: values.email,
        name: values.name,
        loginMethod: values.loginMethod,
        lastSignedIn: values.lastSignedIn,
      },
    });

    return await getUserByClerkId(clerkUserId);
  } catch (error) {
    console.error("[Database] Failed to upsert user from Clerk:", error);
    throw error;
  }
}
