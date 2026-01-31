import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { atividadeProgress } from "../drizzle/schema";
import { adminProcedure, mentoradoProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

// Progress map with optional notes
interface ProgressData {
  completed: boolean;
  notes?: string | null;
}

export const atividadesRouter = router({
  /**
   * Get all progress for the current mentorado (includes notes)
   */
  getProgress: mentoradoProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const progress = await db
      .select()
      .from(atividadeProgress)
      .where(eq(atividadeProgress.mentoradoId, ctx.mentorado.id));

    // Convert to a map with completed status and notes
    const progressMap: Record<string, ProgressData> = {};
    for (const p of progress) {
      const key = `${p.atividadeCodigo}:${p.stepCodigo}`;
      progressMap[key] = {
        completed: p.completed === "sim",
        notes: p.notes,
      };
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

      const progressMap: Record<string, ProgressData> = {};
      for (const p of progress) {
        const key = `${p.atividadeCodigo}:${p.stepCodigo}`;
        progressMap[key] = {
          completed: p.completed === "sim",
          notes: p.notes,
        };
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
        await db
          .update(atividadeProgress)
          .set({
            completed: input.completed ? "sim" : "nao",
            completedAt: input.completed ? new Date() : null,
          })
          .where(eq(atividadeProgress.id, existing[0].id));
      } else {
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

  /**
   * Update notes for a specific step
   */
  updateNote: mentoradoProcedure
    .input(
      z.object({
        atividadeCodigo: z.string(),
        stepCodigo: z.string(),
        notes: z.string(),
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
        await db
          .update(atividadeProgress)
          .set({ notes: input.notes || null })
          .where(eq(atividadeProgress.id, existing[0].id));
      } else {
        // Create entry with note (even if not completed)
        await db.insert(atividadeProgress).values({
          mentoradoId: ctx.mentorado.id,
          atividadeCodigo: input.atividadeCodigo,
          stepCodigo: input.stepCodigo,
          completed: "nao",
          notes: input.notes || null,
        });
      }

      return { success: true };
    }),
});
