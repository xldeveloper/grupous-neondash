/**
 * AI Assistant Router
 *
 * tRPC router for AI assistant endpoints.
 * Replaces legacy OpenClaw/MoltBot router.
 */

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { mentorados } from "../drizzle/schema";
import { isAIConfigured } from "./_core/aiProvider";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { type AIMessage, chat, query } from "./services/aiAssistantService";

/**
 * Get mentorado for the current user
 */
async function getMentoradoForUser(userId: number) {
  const db = getDb();
  const result = await db.select().from(mentorados).where(eq(mentorados.userId, userId)).limit(1);

  return result[0] ?? null;
}

export const aiAssistantRouter = router({
  /**
   * Check if AI service is available
   */
  status: protectedProcedure.query(() => {
    return {
      configured: isAIConfigured(),
      model: "gemini-2.5-flash",
      provider: "google",
    };
  }),

  /**
   * Send a chat message and get a response
   */
  chat: protectedProcedure
    .input(
      z.object({
        messages: z
          .array(
            z.object({
              role: z.enum(["user", "assistant", "system"]),
              content: z.string(),
            })
          )
          .min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentorado = await getMentoradoForUser(ctx.user.id);

      if (!mentorado) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Mentee profile not found. Please complete your registration first.",
        });
      }

      const context = {
        mentorado,
        userId: ctx.user.id,
        mentoradoId: mentorado.id,
      };

      const result = await chat(input.messages as AIMessage[], context);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
          cause: result.error,
        });
      }

      return {
        message: result.message,
        toolsUsed: result.toolsUsed,
      };
    }),

  /**
   * Quick query without conversation history
   */
  query: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentorado = await getMentoradoForUser(ctx.user.id);

      if (!mentorado) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Mentee profile not found.",
        });
      }

      const context = {
        mentorado,
        userId: ctx.user.id,
        mentoradoId: mentorado.id,
      };

      const result = await query(input.prompt, context);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.message,
        });
      }

      return {
        message: result.message,
        toolsUsed: result.toolsUsed,
      };
    }),

  /**
   * Get context data for the AI assistant (mentorado info, recent metrics, etc.)
   * This is useful for displaying context in the UI.
   */
  getContext: protectedProcedure.query(async ({ ctx }) => {
    const mentorado = await getMentoradoForUser(ctx.user.id);

    if (!mentorado) {
      return {
        hasProfile: false,
        mentorado: null,
      };
    }

    return {
      hasProfile: true,
      mentorado: {
        id: mentorado.id,
        nome: mentorado.nomeCompleto,
        turma: mentorado.turma,
        metaFaturamento: mentorado.metaFaturamento,
      },
      aiConfigured: isAIConfigured(),
    };
  }),
});
