import { z } from "zod";
import { notifyOwner } from "./notification";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./trpc";
import { getCacheStats } from "./sessionCache";
import { getQueueStats, getFailedTasks, retryFailedTasks } from "./webhookQueue";
import { getDb } from "../db";

/**
 * Measure database latency with a simple query.
 */
async function measureDbLatency(): Promise<number> {
  const start = performance.now();
  const db = getDb();

  try {
    await db.execute("SELECT 1");
    return Math.round(performance.now() - start);
  } catch {
    return -1; // Error
  }
}

export const systemRouter = router({
  health: publicProcedure
    .input(
      z.object({
        timestamp: z.number().min(0, "timestamp cannot be negative"),
      })
    )
    .query(() => ({
      ok: true,
    })),

  /**
   * Health check endpoint with cache and DB stats.
   */
  healthCheck: protectedProcedure.query(async () => {
    const cacheStats = getCacheStats();
    const dbLatency = await measureDbLatency();
    const queueStats = getQueueStats();

    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
      cache: {
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: `${cacheStats.hitRate}%`,
      },
      database: {
        latencyMs: dbLatency,
        connected: dbLatency >= 0,
      },
      webhookQueue: {
        pending: queueStats.pending,
        size: queueStats.size,
        failedCount: queueStats.failedCount,
      },
    };
  }),

  /**
   * Get detailed failed webhook tasks (admin only).
   */
  failedWebhooks: adminProcedure.query(() => {
    return getFailedTasks();
  }),

  /**
   * Retry all failed webhook tasks (admin only).
   */
  retryFailedWebhooks: adminProcedure.mutation(async () => {
    const retried = await retryFailedTasks();
    return { retried };
  }),

  notifyOwner: adminProcedure
    .input(
      z.object({
        title: z.string().min(1, "title is required"),
        content: z.string().min(1, "content is required"),
      })
    )
    .mutation(async ({ input }) => {
      const delivered = await notifyOwner(input);
      return {
        success: delivered,
      } as const;
    }),
});
