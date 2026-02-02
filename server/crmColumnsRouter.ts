import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { crmColumnConfig } from "../drizzle/schema";
import { mentoradoProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

export const crmColumnsRouter = router({
  list: mentoradoProcedure.query(async ({ ctx }) => {
    const db = getDb();
    const columns = await db
      .select()
      .from(crmColumnConfig)
      .where(eq(crmColumnConfig.mentoradoId, ctx.mentorado.id))
      .orderBy(asc(crmColumnConfig.order));
    return columns;
  }),

  save: mentoradoProcedure
    .input(
      z.array(
        z.object({
          originalId: z.string(),
          label: z.string(),
          color: z.string(),
          visible: z.enum(["sim", "nao"]),
          order: z.number(),
        })
      )
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      // Transaction to upsert all
      await db.transaction(async (tx) => {
        for (const col of input) {
          await tx
            .insert(crmColumnConfig)
            .values({
              mentoradoId: ctx.mentorado.id,
              originalId: col.originalId,
              label: col.label,
              color: col.color,
              visible: col.visible,
              order: col.order,
            })
            .onConflictDoUpdate({
              target: [crmColumnConfig.mentoradoId, crmColumnConfig.originalId],
              set: {
                label: col.label,
                color: col.color,
                visible: col.visible,
                order: col.order,
                updatedAt: new Date(),
              },
            });
        }
      });

      return { success: true };
    }),
});
