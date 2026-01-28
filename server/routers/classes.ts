
import { z } from "zod";
import { mentoradoProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { classes, classProgress } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const classesRouter = router({
  list: mentoradoProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Fetch classes and join with progress for the current mentorado
    // Note: Drizzle's query builder for joins can be verbose, so we might fetch classes and progress separately
    // or use a raw query if needed. For now, let's fetch separately and merge in JS for simplicity unless performance is critical.
    
    const allClasses = await db
      .select()
      .from(classes)
      .orderBy(desc(classes.date));

    const progress = await db
      .select()
      .from(classProgress)
      .where(eq(classProgress.mentoradoId, ctx.mentorado.id));

    const progressMap = new Map(progress.map(p => [p.classId, p]));

    return allClasses.map(c => ({
      ...c,
      watched: progressMap.has(c.id),
      completedAt: progressMap.get(c.id)?.completedAt || null,
    }));
  }),

  markWatched: mentoradoProcedure
    .input(z.object({
      classId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if already watched
      const existing = await db
        .select()
        .from(classProgress)
        .where(
          and(
            eq(classProgress.mentoradoId, ctx.mentorado.id),
            eq(classProgress.classId, input.classId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return existing[0];
      }

      const [newProgress] = await db
        .insert(classProgress)
        .values({
          mentoradoId: ctx.mentorado.id,
          classId: input.classId,
          status: "watched",
          completedAt: new Date(),
        })
        .returning();

      return newProgress;
    }),
});
