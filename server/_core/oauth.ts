import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getMentoradoByEmail } from "../mentorados";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Setting cookie with options:", {
        cookieName: COOKIE_NAME,
        options: cookieOptions,
        hostname: req.hostname,
        protocol: req.protocol,
        headers: {
          'x-forwarded-proto': req.headers['x-forwarded-proto'],
          'x-forwarded-host': req.headers['x-forwarded-host'],
        },
      });
      
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      // Determine redirect path based on user type
      let redirectPath = "/dashboard";
      
      // Check if user is a mentorado (has linked email)
      if (userInfo.email) {
        try {
          const mentorado = await getMentoradoByEmail(userInfo.email);
          if (mentorado) {
            // User is a mentorado, redirect to their personal dashboard
            redirectPath = "/meu-dashboard";
            console.log("[OAuth] User is a mentorado, redirecting to /meu-dashboard");
          } else {
            // User is not a mentorado, check if admin
            const user = await db.getUserByOpenId(userInfo.openId);
            if (user?.role === "admin") {
              redirectPath = "/dashboard";
              console.log("[OAuth] User is admin, redirecting to /dashboard");
            } else {
              // Regular user without mentorado profile
              redirectPath = "/primeiro-acesso";
              console.log("[OAuth] User has no mentorado profile, redirecting to /primeiro-acesso");
            }
          }
        } catch (error) {
          console.warn("[OAuth] Error checking mentorado status:", error);
          // Fall back to dashboard on error
        }
      }
      
      console.log("[OAuth] Redirecting user:", {
        openId: userInfo.openId,
        email: userInfo.email,
        name: userInfo.name,
        redirectPath,
      });

      res.redirect(302, redirectPath);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
