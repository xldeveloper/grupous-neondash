import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  getMentoradoByUserId,
  getAllMentorados,
  createMentorado,
  getMetricasMensaisByMentorado,
  getMetricaMensal,
  upsertMetricaMensal,
  getFeedback,
  upsertFeedback,
} from "./mentorados";

export const mentoradosRouter = router({
  // Get current user's mentorado profile
  me: protectedProcedure.query(async ({ ctx }) => {
    return await getMentoradoByUserId(ctx.user.id);
  }),

  // Get all mentorados (admin only)
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Acesso negado");
    }
    return await getAllMentorados();
  }),

  // Create mentorado profile
  create: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        nomeCompleto: z.string(),
        turma: z.enum(["neon_estrutura", "neon_escala"]),
        metaFaturamento: z.number().default(16000),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createMentorado(input);
      return { id };
    }),

  // Get metrics history for a mentorado
  metricas: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let mentoradoId = input.mentoradoId;

      // If no mentoradoId provided, use current user's
      if (!mentoradoId) {
        const mentorado = await getMentoradoByUserId(ctx.user.id);
        if (!mentorado) {
          throw new Error("Perfil de mentorado não encontrado");
        }
        mentoradoId = mentorado.id;
      }

      // Admin can see any mentorado, users can only see their own
      if (ctx.user.role !== "admin") {
        const mentorado = await getMentoradoByUserId(ctx.user.id);
        if (!mentorado || mentorado.id !== mentoradoId) {
          throw new Error("Acesso negado");
        }
      }

      return await getMetricasMensaisByMentorado(mentoradoId);
    }),

  // Get specific month metrics
  metricaMes: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number().optional(),
        ano: z.number(),
        mes: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      let mentoradoId = input.mentoradoId;

      if (!mentoradoId) {
        const mentorado = await getMentoradoByUserId(ctx.user.id);
        if (!mentorado) {
          throw new Error("Perfil de mentorado não encontrado");
        }
        mentoradoId = mentorado.id;
      }

      if (ctx.user.role !== "admin") {
        const mentorado = await getMentoradoByUserId(ctx.user.id);
        if (!mentorado || mentorado.id !== mentoradoId) {
          throw new Error("Acesso negado");
        }
      }

      return await getMetricaMensal(mentoradoId, input.ano, input.mes);
    }),

  // Submit/update monthly metrics
  submitMetricas: protectedProcedure
    .input(
      z.object({
        ano: z.number(),
        mes: z.number().min(1).max(12),
        faturamento: z.number().min(0),
        lucro: z.number().min(0),
        postsFeed: z.number().min(0),
        stories: z.number().min(0),
        leads: z.number().min(0),
        procedimentos: z.number().min(0),
        observacoes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentorado = await getMentoradoByUserId(ctx.user.id);
      if (!mentorado) {
        throw new Error("Perfil de mentorado não encontrado. Entre em contato com o administrador.");
      }

      const id = await upsertMetricaMensal({
        mentoradoId: mentorado.id,
        ...input,
      });

      return { id };
    }),

  // Get feedback for specific month
  feedback: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number().optional(),
        ano: z.number(),
        mes: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      let mentoradoId = input.mentoradoId;

      if (!mentoradoId) {
        const mentorado = await getMentoradoByUserId(ctx.user.id);
        if (!mentorado) {
          return null;
        }
        mentoradoId = mentorado.id;
      }

      if (ctx.user.role !== "admin") {
        const mentorado = await getMentoradoByUserId(ctx.user.id);
        if (!mentorado || mentorado.id !== mentoradoId) {
          throw new Error("Acesso negado");
        }
      }

      return await getFeedback(mentoradoId, input.ano, input.mes);
    }),

  // Admin: Submit feedback for a mentorado
  submitFeedback: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number(),
        ano: z.number(),
        mes: z.number().min(1).max(12),
        analiseMes: z.string(),
        focoProximoMes: z.string(),
        sugestaoMentor: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Apenas administradores podem enviar feedbacks");
      }

      const id = await upsertFeedback(input);
      return { id };
    }),
});
