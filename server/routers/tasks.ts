
import { z } from "zod";
import { mentoradoProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tasks } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const tasksRouter = router({
  list: mentoradoProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db
      .select()
      .from(tasks)
      .where(eq(tasks.mentoradoId, ctx.mentorado.id))
      .orderBy(desc(tasks.createdAt));
  }),

  create: mentoradoProcedure
    .input(z.object({
      title: z.string().min(1),
      category: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [newTask] = await db
        .insert(tasks)
        .values({
          mentoradoId: ctx.mentorado.id,
          title: input.title,
          status: "todo",
          category: input.category,
        })
        .returning();

      return newTask;
    }),

  toggle: mentoradoProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["todo", "done"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [updatedTask] = await db
        .update(tasks)
        .set({ status: input.status, updatedAt: new Date() })
        .where(
          and(
            eq(tasks.id, input.id),
            eq(tasks.mentoradoId, ctx.mentorado.id)
          )
        )
        .returning();

      return updatedTask;
    }),

  delete: mentoradoProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(tasks)
        .where(
          and(
            eq(tasks.id, input.id),
            eq(tasks.mentoradoId, ctx.mentorado.id)
          )
        );
      
      return { success: true };
    }),
});
