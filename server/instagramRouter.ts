/**
 * Instagram tRPC Router
 * Handles Instagram OAuth flow and data management endpoints.
 *
 * @module instagramRouter
 */

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { mentorados } from "../drizzle/schema";
import { createLogger } from "./_core/logger";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { instagramService } from "./services/instagramService";

const logger = createLogger({ service: "instagram-router" });

export const instagramRouter = router({
  /**
   * Check if Instagram OAuth is configured
   */
  isConfigured: publicProcedure.query(() => {
    return {
      configured: instagramService.isInstagramConfigured(),
    };
  }),

  /**
   * Get OAuth authorization URL for a mentorado
   */
  getAuthUrl: protectedProcedure
    .input(z.object({ mentoradoId: z.number() }))
    .mutation(({ input }) => {
      if (!instagramService.isInstagramConfigured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Instagram OAuth is not configured. Contact the administrator.",
        });
      }

      const authUrl = instagramService.getAuthUrl(input.mentoradoId);
      return { authUrl };
    }),

  /**
   * Check connection status for a mentorado
   */
  getConnectionStatus: protectedProcedure
    .input(z.object({ mentoradoId: z.number() }))
    .query(async ({ input }) => {
      const token = await instagramService.getInstagramToken(input.mentoradoId);

      if (!token) {
        return {
          isConnected: false,
          instagramAccountId: null,
          instagramUsername: null,
          lastSyncAt: null,
        };
      }

      return {
        isConnected: true,
        instagramAccountId: token.instagramBusinessAccountId,
        instagramUsername: token.instagramUsername,
        lastSyncAt: token.updatedAt,
        expiresAt: token.expiresAt,
      };
    }),

  /**
   * Delete all Instagram data for the current user
   * Used for Meta data deletion compliance
   */
  deleteMyData: protectedProcedure.mutation(async ({ ctx }) => {
    const mentoradoId = ctx.mentorado?.id;
    const userId = ctx.user?.id;

    if (!mentoradoId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No mentee profile found for this user.",
      });
    }

    logger.info("delete_data_request", { mentoradoId, userId });

    try {
      // Revoke access and delete all Instagram data
      const success = await instagramService.revokeAccess(mentoradoId, logger);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error removing Instagram data. Please try again.",
        });
      }

      logger.info("delete_data_success", { mentoradoId });

      return {
        success: true,
        message: "All Instagram data has been successfully removed.",
      };
    } catch (error) {
      logger.error("delete_data_failed", error, { mentoradoId });

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error processing data deletion request.",
      });
    }
  }),

  /**
   * Save Instagram token from Facebook SDK login
   */
  saveToken: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number(),
        accessToken: z.string(),
        instagramAccountId: z.string(),
        instagramUsername: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      logger.info("save_token", {
        mentoradoId: input.mentoradoId,
        instagramAccountId: input.instagramAccountId,
      });

      try {
        // Exchange short-lived token from FB SDK for long-lived token (60 days)
        const longLivedResponse = await instagramService.exchangeForLongLivedToken(
          input.accessToken
        );

        const expiresAt = new Date(Date.now() + longLivedResponse.expires_in * 1000);

        await instagramService.upsertInstagramToken({
          mentoradoId: input.mentoradoId,
          accessToken: longLivedResponse.access_token,
          expiresAt,
          scope: "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement",
          instagramBusinessAccountId: input.instagramAccountId,
          instagramUsername: input.instagramUsername,
        });

        // Update connection status in mentorados table
        const db = getDb();
        await db
          .update(mentorados)
          .set({
            instagramConnected: "sim",
            instagramBusinessAccountId: input.instagramAccountId,
            updatedAt: new Date(),
          })
          .where(eq(mentorados.id, input.mentoradoId));

        return { success: true };
      } catch (error) {
        logger.error("save_token_failed", error, { mentoradoId: input.mentoradoId });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Error saving Instagram token.",
        });
      }
    }),

  /**
   * Disconnect Instagram
   */
  disconnect: protectedProcedure
    .input(z.object({ mentoradoId: z.number() }))
    .mutation(async ({ input }) => {
      const success = await instagramService.revokeAccess(input.mentoradoId, logger);

      return {
        success,
        message: success ? "Instagram disconnected successfully." : "Error disconnecting Instagram.",
      };
    }),

  /**
   * Manually trigger sync for a mentorado
   */
  syncMetrics: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number(),
        ano: z.number().min(2020).max(2100),
        mes: z.number().min(1).max(12),
      })
    )
    .mutation(async ({ input }) => {
      const result = await instagramService.syncMentoradoMetrics(
        input.mentoradoId,
        input.ano,
        input.mes
      );

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.errorMessage ?? "Error syncing metrics.",
        });
      }

      return {
        success: true,
        posts: result.postsCount,
        stories: result.storiesCount,
      };
    }),

  /**
   * Get metrics history for the last 6 months
   */
  getMetricsHistory: protectedProcedure
    .input(z.object({ mentoradoId: z.number() }))
    .query(async ({ input }) => {
      const history = await instagramService.getMetricsHistory(input.mentoradoId, 6);

      // Format with month labels
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      return history.map((h) => ({
        ano: h.ano,
        mes: h.mes,
        label: `${months[h.mes - 1]}/${h.ano.toString().slice(-2)}`,
        postsFeed: h.postsFeed,
        stories: h.stories,
        followers: h.followers,
        engagement: h.engagement,
      }));
    }),
});
