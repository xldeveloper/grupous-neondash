import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getAuth } from "@clerk/express";
import { upsertUserFromClerk } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const auth = getAuth(opts.req);

  if (!auth.userId) {
    return { req: opts.req, res: opts.res, user: null };
  }

  // Sync user from Clerk to local DB
  const user = await upsertUserFromClerk(auth.userId);

  return {
    req: opts.req,
    res: opts.res,
    user: user ?? null,
  };
}
