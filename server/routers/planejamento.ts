import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { weeklyPlanProgress, weeklyPlans } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const planejamentoRouter = router({
  /**
   * Get the active weekly plan for a mentorado
   */
  getActive: protectedProcedure
    .input(
      z
        .object({
          mentoradoId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;

      if (input?.mentoradoId) {
        const isOwnId = input.mentoradoId === ctx.mentorado?.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isOwnId && !isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins podem visualizar planejamento de outros.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
        });
      }

      // Get the most recent active plan
      const [plan] = await db
        .select()
        .from(weeklyPlans)
        .where(and(eq(weeklyPlans.mentoradoId, targetMentoradoId), eq(weeklyPlans.ativo, "sim")))
        .orderBy(desc(weeklyPlans.ano), desc(weeklyPlans.mes), desc(weeklyPlans.semana))
        .limit(1);

      if (!plan) return null;

      // Get progress for this plan
      const progress = await db
        .select()
        .from(weeklyPlanProgress)
        .where(
          and(
            eq(weeklyPlanProgress.planId, plan.id),
            eq(weeklyPlanProgress.mentoradoId, targetMentoradoId)
          )
        );

      return { ...plan, progress };
    }),

  /**
   * List all plans for a mentorado (history)
   */
  list: protectedProcedure
    .input(
      z
        .object({
          mentoradoId: z.number().optional(),
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;

      if (input?.mentoradoId) {
        const isOwnId = input.mentoradoId === ctx.mentorado?.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isOwnId && !isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins podem visualizar planejamento de outros.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
        });
      }

      return db
        .select()
        .from(weeklyPlans)
        .where(eq(weeklyPlans.mentoradoId, targetMentoradoId))
        .orderBy(desc(weeklyPlans.ano), desc(weeklyPlans.mes), desc(weeklyPlans.semana))
        .limit(input?.limit ?? 10);
    }),

  /**
   * Create or update a weekly plan (admin only)
   */
  upsert: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number(),
        semana: z.number().min(1).max(5),
        ano: z.number(),
        mes: z.number().min(1).max(12),
        titulo: z.string().min(1).max(255),
        conteudo: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas admins podem criar planejamentos.",
        });
      }

      // Check if plan exists for this week
      const [existing] = await db
        .select()
        .from(weeklyPlans)
        .where(
          and(
            eq(weeklyPlans.mentoradoId, input.mentoradoId),
            eq(weeklyPlans.ano, input.ano),
            eq(weeklyPlans.mes, input.mes),
            eq(weeklyPlans.semana, input.semana)
          )
        )
        .limit(1);

      if (existing) {
        // Update existing plan
        const [updated] = await db
          .update(weeklyPlans)
          .set({
            titulo: input.titulo,
            conteudo: input.conteudo,
            updatedAt: new Date(),
          })
          .where(eq(weeklyPlans.id, existing.id))
          .returning();

        return updated;
      }

      // Deactivate previous plans
      await db
        .update(weeklyPlans)
        .set({ ativo: "nao", updatedAt: new Date() })
        .where(eq(weeklyPlans.mentoradoId, input.mentoradoId));

      // Create new plan
      const [newPlan] = await db
        .insert(weeklyPlans)
        .values({
          mentoradoId: input.mentoradoId,
          semana: input.semana,
          ano: input.ano,
          mes: input.mes,
          titulo: input.titulo,
          conteudo: input.conteudo,
          ativo: "sim",
          createdBy: ctx.user.id,
        })
        .returning();

      return newPlan;
    }),

  /**
   * Toggle step completion
   */
  toggleStep: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        stepIndex: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const mentoradoId = ctx.mentorado?.id;
      if (!mentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
        });
      }

      // Check plan belongs to mentorado
      const [plan] = await db
        .select()
        .from(weeklyPlans)
        .where(eq(weeklyPlans.id, input.planId))
        .limit(1);

      if (!plan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Planejamento não encontrado." });
      }

      const isOwner = plan.mentoradoId === mentoradoId;
      const isAdmin = ctx.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if progress exists
      const [existing] = await db
        .select()
        .from(weeklyPlanProgress)
        .where(
          and(
            eq(weeklyPlanProgress.planId, input.planId),
            eq(weeklyPlanProgress.mentoradoId, plan.mentoradoId),
            eq(weeklyPlanProgress.stepIndex, input.stepIndex)
          )
        )
        .limit(1);

      if (existing) {
        // Toggle
        const newCompleted = existing.completed === "sim" ? "nao" : "sim";
        const [updated] = await db
          .update(weeklyPlanProgress)
          .set({
            completed: newCompleted,
            completedAt: newCompleted === "sim" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(weeklyPlanProgress.id, existing.id))
          .returning();

        return updated;
      }

      // Create new progress entry
      const [newProgress] = await db
        .insert(weeklyPlanProgress)
        .values({
          planId: input.planId,
          mentoradoId: plan.mentoradoId,
          stepIndex: input.stepIndex,
          completed: "sim",
          completedAt: new Date(),
        })
        .returning();

      return newProgress;
    }),

  /**
   * Update step notes
   */
  updateStepNotes: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        stepIndex: z.number(),
        notes: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const mentoradoId = ctx.mentorado?.id;
      if (!mentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
        });
      }

      // Check plan belongs to mentorado
      const [plan] = await db
        .select()
        .from(weeklyPlans)
        .where(eq(weeklyPlans.id, input.planId))
        .limit(1);

      if (!plan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Planejamento não encontrado." });
      }

      const isOwner = plan.mentoradoId === mentoradoId;
      const isAdmin = ctx.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Check if progress exists
      const [existing] = await db
        .select()
        .from(weeklyPlanProgress)
        .where(
          and(
            eq(weeklyPlanProgress.planId, input.planId),
            eq(weeklyPlanProgress.mentoradoId, plan.mentoradoId),
            eq(weeklyPlanProgress.stepIndex, input.stepIndex)
          )
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(weeklyPlanProgress)
          .set({
            notes: input.notes,
            updatedAt: new Date(),
          })
          .where(eq(weeklyPlanProgress.id, existing.id))
          .returning();

        return updated;
      }

      // Create new progress entry with notes
      const [newProgress] = await db
        .insert(weeklyPlanProgress)
        .values({
          planId: input.planId,
          mentoradoId: plan.mentoradoId,
          stepIndex: input.stepIndex,
          notes: input.notes,
          completed: "nao",
        })
        .returning();

      return newProgress;
    }),

  /**
   * Get all progress for a plan
   */
  getProgress: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      const mentoradoId = ctx.mentorado?.id;
      const isAdmin = ctx.user?.role === "admin";

      // Check plan exists and belongs to mentorado
      const [plan] = await db
        .select()
        .from(weeklyPlans)
        .where(eq(weeklyPlans.id, input.planId))
        .limit(1);

      if (!plan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Planejamento não encontrado." });
      }

      const isOwner = plan.mentoradoId === mentoradoId;

      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db
        .select()
        .from(weeklyPlanProgress)
        .where(eq(weeklyPlanProgress.planId, input.planId));
    }),

  /**
   * Delete a weekly plan (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas admins podem deletar planejamentos.",
        });
      }

      await db.delete(weeklyPlans).where(eq(weeklyPlans.id, input.id));
      return { success: true };
    }),
});
