import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { interactionTemplates } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";

export const interactionTemplatesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const templates = await db
      .select()
      .from(interactionTemplates)
      .where(eq(interactionTemplates.userId, ctx.user.id))
      .orderBy(desc(interactionTemplates.createdAt));

    return {
      templates,
    };
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(["whatsapp", "email", "ligacao", "reuniao", "nota"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [template] = await db
        .insert(interactionTemplates)
        .values({
          userId: ctx.user.id,
          title: input.title,
          content: input.content,
          type: input.type as any,
        })
        .returning();

      return template;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        type: z
          .enum(["whatsapp", "email", "ligacao", "reuniao", "nota"])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(interactionTemplates)
        .where(eq(interactionTemplates.id, input.id));

      if (!existing || existing.userId !== ctx.user.id) {
        throw new Error("Template não encontrado ou não autorizado");
      }

      const [updated] = await db
        .update(interactionTemplates)
        .set({
          ...(input.title ? { title: input.title } : {}),
          ...(input.content ? { content: input.content } : {}),
          ...(input.type ? { type: input.type as any } : {}),
          updatedAt: new Date(),
        })
        .where(eq(interactionTemplates.id, input.id))
        .returning();

      return updated;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const [existing] = await db
        .select()
        .from(interactionTemplates)
        .where(eq(interactionTemplates.id, input.id));

      if (!existing || existing.userId !== ctx.user.id) {
        throw new Error("Template não encontrado ou não autorizado");
      }

      await db
        .delete(interactionTemplates)
        .where(eq(interactionTemplates.id, input.id));

      return { success: true };
    }),
});
