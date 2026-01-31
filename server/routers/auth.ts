import { and, eq, isNull } from "drizzle-orm";
import { mentorados } from "../../drizzle/schema";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /**
   * Diagnostic endpoint to check user sync status
   * Returns detailed information about the user's connection to Clerk, DB, and Mentorado
   */
  diagnostic: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.user!;
    const db = getDb();

    // Check for mentorado by userId
    const mentoradoByUserId = await db.query.mentorados.findFirst({
      where: eq(mentorados.userId, user.id),
    });

    // Check for mentorado by email (unlinked)
    const mentoradoByEmail = user.email
      ? await db.query.mentorados.findFirst({
          where: and(eq(mentorados.email, user.email), isNull(mentorados.userId)),
        })
      : null;

    // Count total mentorados with same email (linked and unlinked)
    const allMentoradosWithEmail = user.email
      ? await db.select().from(mentorados).where(eq(mentorados.email, user.email))
      : [];

    // Build status
    const status = {
      isFullyLinked: !!mentoradoByUserId,
      hasUnlinkedMatch: !!mentoradoByEmail,
      multipleMatches: allMentoradosWithEmail.length > 1,
    };

    // Build recommendations
    const recommendations: string[] = [];

    if (!status.isFullyLinked && status.hasUnlinkedMatch) {
      recommendations.push(
        "Existe um mentorado com seu email que pode ser vinculado automaticamente."
      );
    }

    if (!status.isFullyLinked && !status.hasUnlinkedMatch) {
      recommendations.push(
        "Nenhum mentorado encontrado com seu email. Um novo será criado automaticamente ou contate o administrador."
      );
    }

    if (status.multipleMatches) {
      recommendations.push(
        "Existem múltiplos registros com seu email. Contate o administrador para resolver duplicatas."
      );
    }

    return {
      timestamp: new Date().toISOString(),
      clerk: {
        userId: user.clerkId,
        email: user.email,
        name: user.name,
        role: user.role,
        loginMethod: user.loginMethod,
      },
      database: {
        userId: user.id,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      },
      mentorado: mentoradoByUserId
        ? {
            id: mentoradoByUserId.id,
            nomeCompleto: mentoradoByUserId.nomeCompleto,
            turma: mentoradoByUserId.turma,
            ativo: mentoradoByUserId.ativo,
          }
        : null,
      status,
      recommendations,
      contextMentorado: ctx.mentorado
        ? {
            id: ctx.mentorado.id,
            nome: ctx.mentorado.nomeCompleto,
          }
        : null,
    };
  }),

  /**
   * Syncs the logged-in user with the mentorados table using email.
   * Note: The 'createContext' middleware already handles auto-linking and auto-creation.
   * This mutation serves as a manual trigger/verification and can handle edge cases if needed.
   */
  syncUser: protectedProcedure.mutation(async ({ ctx }) => {
    // User is guaranteed to exist due to protectedProcedure
    const user = ctx.user!;
    const db = getDb();

    // If already linked in context, return success
    if (ctx.mentorado) {
      return {
        success: true,
        linked: true,
        user,
        mentoradoId: ctx.mentorado.id,
        message: "Already linked",
      };
    }

    let linked = false;
    let mentoradoId = null;

    if (user.email) {
      // Find unlinked mentorado with same email
      const existingMentorado = await db.query.mentorados.findFirst({
        where: and(eq(mentorados.email, user.email), isNull(mentorados.userId)),
      });

      if (existingMentorado) {
        await db
          .update(mentorados)
          .set({ userId: user.id })
          .where(eq(mentorados.id, existingMentorado.id));

        linked = true;
        mentoradoId = existingMentorado.id;
      }
    }

    return {
      success: true,
      linked,
      user,
      mentoradoId,
      message: linked ? "Linked successfully" : "No matching unlinked mentorado found",
    };
  }),
});
