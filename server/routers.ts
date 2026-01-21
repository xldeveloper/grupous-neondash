import { publicProcedure, router } from "./_core/trpc";
import { systemRouter } from "./_core/systemRouter";
import { mentoradosRouter } from "./mentoradosRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
  }),
  mentorados: mentoradosRouter,
});

export type AppRouter = typeof appRouter;
