import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { classes, classProgress } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const classesRouter = router({
  list: protectedProcedure
    .input(z.object({ mentoradoId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;

      if (input?.mentoradoId) {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Forbidden" });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mentorado profile required",
        });
      }

      // Fetch classes and join with progress for the current mentorado
      // Note: Drizzle's query builder for joins can be verbose, so we might fetch classes and progress separately
      // or use a raw query if needed. For now, let's fetch separately and merge in JS for simplicity unless performance is critical.

      const allClasses = await db.select().from(classes).orderBy(desc(classes.date));

      const progress = await db
        .select()
        .from(classProgress)
        .where(eq(classProgress.mentoradoId, targetMentoradoId));

      const progressMap = new Map(progress.map((p) => [p.classId, p]));

      return allClasses.map((c) => ({
        ...c,
        watched: progressMap.has(c.id),
        completedAt: progressMap.get(c.id)?.completedAt || null,
      }));
    }),

  markWatched: protectedProcedure
    .input(
      z.object({
        classId: z.number(),
        mentoradoId: z.number().optional(), // Admin override
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;
      if (input.mentoradoId) {
        if (ctx.user?.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
        targetMentoradoId = input.mentoradoId;
      }
      if (!targetMentoradoId) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Check if already watched
      const existing = await db
        .select()
        .from(classProgress)
        .where(
          and(
            eq(classProgress.mentoradoId, targetMentoradoId),
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
          mentoradoId: targetMentoradoId,
          classId: input.classId,
          status: "watched",
          completedAt: new Date(),
        })
        .returning();

      return newProgress;
    }),
});
