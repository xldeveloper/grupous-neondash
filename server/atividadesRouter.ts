import { z } from "zod";
import { router, mentoradoProcedure, adminProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { atividadeProgress } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const atividadesRouter = router({
  /**
   * Get all progress for the current mentorado
   */
  getProgress: mentoradoProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const progress = await db
      .select()
      .from(atividadeProgress)
      .where(eq(atividadeProgress.mentoradoId, ctx.mentorado.id));

    // Convert to a map for easy lookup
    const progressMap: Record<string, boolean> = {};
    for (const p of progress) {
      const key = `${p.atividadeCodigo}:${p.stepCodigo}`;
      progressMap[key] = p.completed === "sim";
    }
    return progressMap;
  }),

  /**
   * Get progress for a specific mentorado (admin only)
   */
  getProgressById: adminProcedure
    .input(z.object({ mentoradoId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const progress = await db
        .select()
        .from(atividadeProgress)
        .where(eq(atividadeProgress.mentoradoId, input.mentoradoId));

      const progressMap: Record<string, boolean> = {};
      for (const p of progress) {
        const key = `${p.atividadeCodigo}:${p.stepCodigo}`;
        progressMap[key] = p.completed === "sim";
      }
      return progressMap;
    }),

  /**
   * Toggle a step's completion status
   */
  toggleStep: mentoradoProcedure
    .input(
      z.object({
        atividadeCodigo: z.string(),
        stepCodigo: z.string(),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(atividadeProgress)
        .where(
          and(
            eq(atividadeProgress.mentoradoId, ctx.mentorado.id),
            eq(atividadeProgress.atividadeCodigo, input.atividadeCodigo),
            eq(atividadeProgress.stepCodigo, input.stepCodigo)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing
        await db
          .update(atividadeProgress)
          .set({
            completed: input.completed ? "sim" : "nao",
            completedAt: input.completed ? new Date() : null,
          })
          .where(eq(atividadeProgress.id, existing[0].id));
      } else {
        // Insert new
        await db.insert(atividadeProgress).values({
          mentoradoId: ctx.mentorado.id,
          atividadeCodigo: input.atividadeCodigo,
          stepCodigo: input.stepCodigo,
          completed: input.completed ? "sim" : "nao",
          completedAt: input.completed ? new Date() : null,
        });
      }

      return { success: true };
    }),
});
