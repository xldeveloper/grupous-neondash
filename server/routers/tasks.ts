import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { tasks } from "../../drizzle/schema";
import { createLogger } from "../_core/logger";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const tasksRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          mentoradoId: z.number().optional(),
          search: z.string().optional(),
          category: z.string().optional(),
          priority: z.enum(["alta", "media", "baixa"]).optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;

      if (input?.mentoradoId) {
        const isOwnId = input.mentoradoId === ctx.mentorado?.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isOwnId && !isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can view other users' tasks.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mentee profile not found.",
        });
      }

      // Build dynamic WHERE conditions
      const conditions = [eq(tasks.mentoradoId, targetMentoradoId)];

      if (input?.search) {
        conditions.push(ilike(tasks.title, `%${input.search}%`));
      }

      if (input?.category) {
        conditions.push(eq(tasks.category, input.category));
      }

      if (input?.priority) {
        conditions.push(eq(tasks.priority, input.priority));
      }

      return db
        .select()
        .from(tasks)
        .where(and(...conditions))
        .orderBy(desc(tasks.createdAt));
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        category: z.enum(["geral", "aula", "crm", "financeiro", "atividade"]).default("geral"),
        priority: z.enum(["alta", "media", "baixa"]).default("media"),
        source: z.enum(["manual", "atividade"]).default("manual"),
        atividadeCodigo: z.string().optional(),
        mentoradoId: z.number().optional(), // Admin override
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;

      if (input.mentoradoId) {
        const isOwnId = input.mentoradoId === ctx.mentorado?.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isOwnId && !isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can create tasks for others.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mentee profile not found.",
        });
      }

      const [newTask] = await db
        .insert(tasks)
        .values({
          mentoradoId: targetMentoradoId,
          title: input.title,
          category: input.category,
          priority: input.priority,
          source: input.source,
          atividadeCodigo: input.atividadeCodigo,
          status: "todo",
        })
        .returning();

      return newTask;
    }),

  toggle: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      const [task] = await db.select().from(tasks).where(eq(tasks.id, input.id)).limit(1);

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

  generateFromAI: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      const requestId = `ai-tasks-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const logger = createLogger({ service: "tasks-router", requestId });

      logger.info("generateFromAI_started", { mentoradoId: input.mentoradoId });

      const db = getDb();
      const { invokeLLM, validateLLMConfig, LLMConfigurationError, LLMInvocationError } =
        await import("../_core/llm");
      const { metricasMensais, diagnosticos, mentorados, leads, systemSettings } = await import(
        "../../drizzle/schema"
      );

      let targetMentoradoId = ctx.mentorado?.id;

      if (input.mentoradoId) {
        const isOwnId = input.mentoradoId === ctx.mentorado?.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isOwnId && !isAdmin) {
          logger.warn("unauthorized_ai_generation_attempt", {
            requestedMentoradoId: input.mentoradoId,
            userId: ctx.user?.id,
          });
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can generate tasks for others.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mentee profile not found.",
        });
      }

      // Validate LLM configuration before attempting generation
      const llmConfig = validateLLMConfig();
      if (!llmConfig.isValid) {
        logger.error("llm_configuration_invalid", { errors: llmConfig.errors });
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "AI configuration incomplete. Contact the administrator.",
        });
      }

      logger.info("llm_config_validated", { provider: llmConfig.provider, model: llmConfig.model });

      // 1. Fetch Prompt from System Settings
      const promptSetting = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, "neon_coach_prompt"),
      });

      const systemPrompt =
        promptSetting?.value ||
        `
      You are an Elite Business Coach for aesthetics clinics (Persona: "Neon Coach").
      Your mission is to analyze the mentee's data and create 3-5 TACTICAL and IMMEDIATE tasks to boost results.

      Rules:
      1. Be direct and imperative.
      2. Focus on: Sales, Marketing (Instagram), and Management.
      3. Use a motivating but demanding tone ("Gamified").
      4. Return ONLY a JSON array of strings. Nothing else.
      Example: ["Call 10 old leads", "Post a story with a Q&A box", "Review product costs"]
      `;

      // 2. Fetch Extended Context
      const [mentoradoData] = await db
        .select()
        .from(mentorados)
        .where(eq(mentorados.id, targetMentoradoId))
        .limit(1);

      const recentMetrics = await db
        .select()
        .from(metricasMensais)
        .where(eq(metricasMensais.mentoradoId, targetMentoradoId))
        .orderBy(desc(metricasMensais.ano), desc(metricasMensais.mes))
        .limit(3); // Increased to 3 months

      const [diagnosticoData] = await db
        .select()
        .from(diagnosticos)
        .where(eq(diagnosticos.mentoradoId, targetMentoradoId))
        .limit(1);

      // Lead Stats
      const leadsCount = await db
        .select({ count: leads.id })
        .from(leads)
        .where(eq(leads.mentoradoId, targetMentoradoId));

      const newLeads = await db
        .select({ count: leads.id })
        .from(leads)
        .where(and(eq(leads.mentoradoId, targetMentoradoId), eq(leads.status, "novo")));

      // Recent Tasks History (to avoid repeats)
      const recentTasks = await db
        .select({ title: tasks.title })
        .from(tasks)
        .where(eq(tasks.mentoradoId, targetMentoradoId))
        .orderBy(desc(tasks.createdAt))
        .limit(5);

      const userContext = `
      Mentee: ${mentoradoData?.nomeCompleto}
      Revenue Goal: R$ ${mentoradoData?.metaFaturamento}

      Recent Metrics (3 months):
      ${recentMetrics
        .map(
          (m) => `- ${m.mes}/${m.ano}: Revenue R$${m.faturamento}, Profit R$${m.lucro}, Leads ${m.leads}`
        )
        .join("\n")}

      Current Sales Funnel:
      - Total Leads in database: ${leadsCount.length}
      - "New" Leads (no contact): ${newLeads.length}

      Diagnosis (Pain points/Goals):
      - Pain: ${diagnosticoData?.incomodaRotina || "Not provided"}
      - Goal: ${diagnosticoData?.objetivo6Meses || "Not provided"}
      - 1-Year Vision: ${diagnosticoData?.visaoUmAno || "Not provided"}
      - Priority: ${diagnosticoData?.nivelPrioridade || "Normal"}

      Recent Tasks (AVOID REPEATING):
      ${recentTasks.map((t) => `- ${t.title}`).join("\n")}
      `;

      logger.info("context_prepared", {
        mentorado: mentoradoData?.nomeCompleto,
        metricsCount: recentMetrics.length,
        hasDiagnostico: !!diagnosticoData,
      });

      // 3. Call LLM with enhanced error handling
      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContext },
          ],
          response_format: { type: "json_object" },
        });

        const content = result.choices[0]?.message?.content as string;

        if (!content) {
          logger.error("llm_empty_response", { result });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Empty AI response. Please try again.",
          });
        }

        logger.info("llm_response_received", {
          contentLength: content.length,
          model: result.model,
          tokens: result.usage,
        });

        let suggestedTasks: string[] = [];

        try {
          const parsed = JSON.parse(content);
          suggestedTasks = Array.isArray(parsed) ? parsed : parsed.tasks || parsed.data || [];

          if (!Array.isArray(suggestedTasks)) {
            logger.error("invalid_tasks_format", { parsed, content });
            throw new Error("Invalid response format: expected array of tasks");
          }
        } catch (parseError) {
          logger.error("json_parse_failed", {
            content,
            error: parseError instanceof Error ? parseError.message : "Unknown error",
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error processing AI response. Please try again.",
          });
        }

        logger.info("tasks_parsed", { taskCount: suggestedTasks.length });

        // 4. Insert tasks
        if (suggestedTasks.length > 0) {
          const tasksToInsert = suggestedTasks
            .filter(
              (title): title is string => typeof title === "string" && title.trim().length > 0
            )
            .map((title) => ({
              mentoradoId: targetMentoradoId!,
              title: title.trim().substring(0, 255),
              status: "todo" as const,
              priority: "alta" as const,
              category: "atividade" as const,
              source: "ai_coach" as const,
            }));

          if (tasksToInsert.length > 0) {
            await db.insert(tasks).values(tasksToInsert);
            logger.info("tasks_inserted", { count: tasksToInsert.length });
          }
        }

        const duration = Date.now() - startTime;
        logger.info("generateFromAI_completed", {
          durationMs: duration,
          tasksGenerated: suggestedTasks.length,
        });

        return { success: true, count: suggestedTasks.length };
      } catch (error: unknown) {
        const duration = Date.now() - startTime;

        // Handle specific LLM errors
        if (error instanceof LLMConfigurationError) {
          logger.error("llm_configuration_error", {
            code: error.code,
            message: error.message,
            durationMs: duration,
          });
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "AI configuration incomplete. Contact the administrator.",
          });
        }

        if (error instanceof LLMInvocationError) {
          logger.error("llm_invocation_error", {
            code: error.code,
            status: error.status,
            message: error.message,
            details: error.details,
            durationMs: duration,
          });

          // Map specific error codes to user-friendly messages
          let userMessage = "Failed to generate plan with AI. Please try again.";

          switch (error.code) {
            case "TIMEOUT":
              userMessage = "The AI took too long to respond. Please try again.";
              break;
            case "RATE_LIMITED":
              userMessage = "Request limit reached. Please wait a moment and try again.";
              break;
            case "UNAUTHORIZED":
              userMessage = "AI authentication error. Contact the administrator.";
              break;
            case "MODEL_NOT_FOUND":
              userMessage = "AI model not found. Contact the administrator.";
              break;
            case "SERVER_ERROR":
              userMessage =
                "AI service temporarily unavailable. Please try again in a few minutes.";
              break;
            case "NETWORK_ERROR":
              userMessage = "Connection error. Check your internet and try again.";
              break;
          }

          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: userMessage,
          });
        }

        // Handle unexpected errors
        logger.error("unexpected_ai_generation_error", {
          error,
          durationMs: duration,
          errorType: error?.constructor?.name,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Unexpected error generating plan. Please try again.",
        });
      }
    }),

  archivePlanTasks: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();

      let targetMentoradoId = ctx.mentorado?.id;

      if (input.mentoradoId) {
        const isOwnId = input.mentoradoId === ctx.mentorado?.id;
        const isAdmin = ctx.user?.role === "admin";

        if (!isOwnId && !isAdmin) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Only admins can archive other users' tasks.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Mentee profile not found.",
        });
      }

      // Archive all AI tasks (source = ai_coach OR category = atividade) that are done
      const result = await db
        .update(tasks)
        .set({ status: "archived", updatedAt: new Date() })
        .where(and(eq(tasks.mentoradoId, targetMentoradoId), eq(tasks.status, "done")))
        .returning({ id: tasks.id });

      return { success: true, count: result.length };
    }),
});
