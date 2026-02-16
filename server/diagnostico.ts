import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { diagnosticos, mentorados } from "../drizzle/schema";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";

export const diagnosticoRouter = router({
  get: protectedProcedure
    .input(z.object({ mentoradoId: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const db = getDb();

      // Case 1: Admin requesting specific mentee
      if (input?.mentoradoId) {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only administrators can view other diagnostics.",
          });
        }
        const result = await db
          .select()
          .from(diagnosticos)
          .where(eq(diagnosticos.mentoradoId, input.mentoradoId))
          .limit(1);
        return result[0] || null;
      }

      // Case 2: User requesting their own diagnostic (Optimized with JOIN)
      // SELECT d.* FROM diagnosticos d
      // JOIN mentorados m ON d.mentorado_id = m.id
      // WHERE m.user_id = ctx.user.id
      const result = await db
        .select({
          diagnostico: diagnosticos,
        })
        .from(diagnosticos)
        .innerJoin(mentorados, eq(diagnosticos.mentoradoId, mentorados.id))
        .where(eq(mentorados.userId, ctx.user.id))
        .limit(1);

      return result[0]?.diagnostico || null;
    }),

  upsert: protectedProcedure
    .input(
      z.object({
        // 1. Starting Point
        atuacaoSaude: z.string().optional(),
        tempoLivre: z.string().optional(),
        jaAtuaEstetica: z.string().optional(),
        temClinica: z.string().optional(),
        // 2. Financial Reality
        rendaMensal: z.string().optional(),
        faturaEstetica: z.string().optional(),
        contas: z.string().optional(),
        custoVida: z.string().optional(),
        capacidadeInvestimento: z.string().optional(), // NEW
        // 3. Current Challenges
        incomodaRotina: z.string().optional(),
        dificuldadeCrescer: z.string().optional(),
        tentativasAnteriores: z.string().optional(), // NEW
        // 4. Vision of Success
        objetivo6Meses: z.string().optional(),
        resultadoTransformador: z.string().optional(),
        visaoUmAno: z.string().optional(), // NEW
        porqueAgora: z.string().optional(), // NEW
        // 5. Commitment
        horasDisponiveis: z.string().optional(), // NEW
        nivelPrioridade: z.string().optional(), // NEW
        redeApoio: z.string().optional(), // NEW
        organizacao: z.string().optional(),
        mentoradoId: z.number().optional(), // Admin override
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      let targetMentoradoId: number;

      // 1. Determine Target Mentee
      if (input.mentoradoId) {
        // Only admin can set mentoradoId
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only administrators can edit other diagnostics.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      } else {
        // Normal user: find their own mentee record
        const mentorado = await db.query.mentorados.findFirst({
          where: eq(mentorados.userId, ctx.user.id),
        });

        if (!mentorado) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "User is not linked to a mentee.",
          });
        }
        targetMentoradoId = mentorado.id;
      }

      // 2. Check if exists
      const existing = await db.query.diagnosticos.findFirst({
        where: eq(diagnosticos.mentoradoId, targetMentoradoId),
      });

      // Prepare data excluding mentoradoId from input to avoid schema conflict if we spread
      const { mentoradoId: _ignored, ...dataToUpsert } = input;

      if (existing) {
        // Update
        const [updated] = await db
          .update(diagnosticos)
          .set({ ...dataToUpsert, updatedAt: new Date() })
          .where(eq(diagnosticos.id, existing.id))
          .returning();
        return updated;
      } else {
        // Create
        const [created] = await db
          .insert(diagnosticos)
          .values({
            mentoradoId: targetMentoradoId,
            ...dataToUpsert,
          })
          .returning();
        return created;
      }
    }),
});
