
import { z } from "zod";
import {
  router,
  protectedProcedure,
  publicProcedure,
} from "../_core/trpc";
import { tasks } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";

export const tasksRouter = router({
  list: protectedProcedure
    .input(z.object({ mentoradoId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();
      
      let targetMentoradoId = ctx.mentorado?.id;

      if (input?.mentoradoId) {
        if (ctx.user?.role !== "admin") {
           throw new TRPCError({ code: "FORBIDDEN", message: "Apenas admins podem visualizar tarefas de outros." });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
         throw new TRPCError({ code: "UNAUTHORIZED", message: "Perfil de mentorado não encontrado." });
      }

      return db
        .select()
        .from(tasks)
        .where(eq(tasks.mentoradoId, targetMentoradoId))
        .orderBy(desc(tasks.createdAt));
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        category: z.enum(["geral", "aula", "crm", "financeiro", "atividade"]).default("geral"),
        source: z.enum(["manual", "atividade"]).default("manual"),
        atividadeCodigo: z.string().optional(),
        mentoradoId: z.number().optional(), // Admin override
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      let targetMentoradoId = ctx.mentorado?.id;

      if (input.mentoradoId) {
        if (ctx.user?.role !== "admin") {
           throw new TRPCError({ code: "FORBIDDEN", message: "Apenas admins podem criar tarefas para outros." });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
         throw new TRPCError({ code: "UNAUTHORIZED", message: "Perfil de mentorado não encontrado." });
      }

      const [newTask] = await db
        .insert(tasks)
        .values({
          mentoradoId: targetMentoradoId,
          title: input.title,
          category: input.category,
          source: input.source,
          atividadeCodigo: input.atividadeCodigo,
          status: "todo",
        })
        .returning();

      return newTask;
    }),

  toggle: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, input.id))
        .limit(1);

      if (!task) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = ctx.mentorado?.id === task.mentoradoId;
      const isAdmin = ctx.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const newStatus = task.status === "done" ? "todo" : "done";

      const [updatedTask] = await db
        .update(tasks)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(tasks.id, input.id))
        .returning();

      return updatedTask;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      const [task] = await db.select().from(tasks).where(eq(tasks.id, input.id)).limit(1);
      if (!task) throw new TRPCError({ code: "NOT_FOUND" });

      const isOwner = ctx.mentorado?.id === task.mentoradoId;
      const isAdmin = ctx.user?.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.delete(tasks).where(eq(tasks.id, input.id));
      return { success: true };
    }),
});
