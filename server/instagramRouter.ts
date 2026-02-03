/**
 * Instagram tRPC Router
 * Handles Instagram OAuth flow and data management endpoints.
 *
 * @module instagramRouter
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createLogger } from "./_core/logger";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
          message: "Instagram OAuth não está configurado. Contate o administrador.",
        });
      }

      const authUrl = instagramService.getAuthUrl(input.mentoradoId);
      return { authUrl };
    }),

  /**
   * Check connection status for the current user's mentorado
   */
  getConnectionStatus: protectedProcedure.query(async ({ ctx }) => {
    const mentoradoId = ctx.mentorado?.id;

    if (!mentoradoId) {
      return {
        connected: false,
        accountId: null,
      };
    }

    const token = await instagramService.getInstagramToken(mentoradoId);

    if (!token) {
      return {
        connected: false,
        accountId: null,
      };
    }

    return {
      connected: true,
      accountId: token.instagramBusinessAccountId,
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
        message: "Nenhum perfil de mentorado encontrado para este usuário.",
      });
    }

    logger.info("delete_data_request", { mentoradoId, userId });

    try {
      // Revoke access and delete all Instagram data
      const success = await instagramService.revokeAccess(mentoradoId, logger);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao remover dados do Instagram. Tente novamente.",
        });
      }

      logger.info("delete_data_success", { mentoradoId });

      return {
        success: true,
        message: "Todos os dados do Instagram foram removidos com sucesso.",
      };
    } catch (error) {
      logger.error("delete_data_failed", error, { mentoradoId });

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao processar solicitação de exclusão de dados.",
      });
    }
  }),

  /**
   * Disconnect Instagram (alias for deleteMyData)
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const mentoradoId = ctx.mentorado?.id;

    if (!mentoradoId) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Nenhum perfil de mentorado encontrado.",
      });
    }

    const success = await instagramService.revokeAccess(mentoradoId, logger);

    return {
      success,
      message: success ? "Instagram desconectado com sucesso." : "Erro ao desconectar Instagram.",
    };
  }),

  /**
   * Manually trigger sync for current mentorado
   */
  syncMetrics: protectedProcedure
    .input(
      z.object({
        ano: z.number().min(2020).max(2100),
        mes: z.number().min(1).max(12),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentoradoId = ctx.mentorado?.id;

      if (!mentoradoId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Nenhum perfil de mentorado encontrado.",
        });
      }

      const result = await instagramService.syncMentoradoMetrics(mentoradoId, input.ano, input.mes);

      if (!result.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: result.errorMessage ?? "Erro ao sincronizar métricas.",
        });
      }

      return {
        success: true,
        postsCount: result.postsCount,
        storiesCount: result.storiesCount,
      };
    }),
});
