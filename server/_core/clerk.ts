import { clerkMiddleware, getAuth } from "@clerk/express";
import type { Request } from "express";

export { clerkMiddleware, getAuth };

export function getClerkUserId(req: Request): string | null {
  const auth = getAuth(req);
  return auth.userId;
}
