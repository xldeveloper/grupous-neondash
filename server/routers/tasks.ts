import { TRPCError } from "@trpc/server";
import { and, desc, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { tasks } from "../../drizzle/schema";
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
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins podem visualizar tarefas de outros.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
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
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins podem criar tarefas para outros.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
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
      const db = getDb();
      const { invokeLLM } = await import("../_core/llm");
      const { metricasMensais, diagnosticos, mentorados } = await import("../../drizzle/schema");

      let targetMentoradoId = ctx.mentorado?.id;

      if (input.mentoradoId) {
        if (ctx.user?.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas admins podem gerar tarefas para outros.",
          });
        }
        targetMentoradoId = input.mentoradoId;
      }

      if (!targetMentoradoId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Perfil de mentorado não encontrado.",
        });
      }

      // Fetch context data
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
        .limit(2);

      const [diagnosticoData] = await db
        .select()
        .from(diagnosticos)
        .where(eq(diagnosticos.mentoradoId, targetMentoradoId))
        .limit(1);

      // Construct Prompt
      const systemPrompt = `
      Você é um Business Coach de Elite para clínicas de estética.
      Sua missão é analisar os dados do mentorado e criar 3-5 tarefas TÁTICAS e IMEDIATAS para alavancar os resultados.
      
      Regras:
      1. Seja direto e imperativo.
      2. Foque em: Vendas, Marketing (Instagram) e Gestão.
      3. Use tom motivador mas exigente ("Gamified").
      4. Retorne APENAS um JSON array de strings. Nada mais.
      Exemplo: ["Ligar para 10 leads antigos", "Postar story com caixinha de perguntas", "Revisar custos de produtos"]
      `;

      const userContext = `
      Mentorado: ${mentoradoData?.nomeCompleto}
      Meta Faturamento: R$ ${mentoradoData?.metaFaturamento}
      
      Últimas Métricas:
      ${recentMetrics
        .map(
          (m) => `- ${m.mes}/${m.ano}: Fat R$${m.faturamento}, Lucro R$${m.lucro}, Leads ${m.leads}`
        )
        .join("\n")}
      
      Diagnóstico (Pontos de dor/Objetivos):
      - Dor: ${diagnosticoData?.incomodaRotina || "Não informado"}
      - Objetivo: ${diagnosticoData?.objetivo6Meses || "Não informado"}
      - Nível Prioridade: ${diagnosticoData?.nivelPrioridade || "Normal"}
      `;

      // Call LLM
      const result = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContext },
        ],
        response_format: { type: "json_object" },
      });

      const content = result.choices[0].message.content as string;
      let suggestedTasks: string[] = [];

      try {
        const parsed = JSON.parse(content);
        // Handle both { tasks: [] } and ["task1", "task2"] formats
        suggestedTasks = Array.isArray(parsed) ? parsed : parsed.tasks || parsed.data || [];
      } catch (e) {
        // Fallback tasks if AI fails to format
        suggestedTasks = [
          "Revisar métricas do mês",
          "Entrar em contato com 5 leads quentes",
          "Planejar conteúdo da semana",
        ];
      }

      // Insert tasks
      if (suggestedTasks.length > 0) {
        await db.insert(tasks).values(
          suggestedTasks.map((title) => ({
            mentoradoId: targetMentoradoId!,
            title: String(title).substring(0, 255), // Safety check
            status: "todo",
            priority: "media" as any,
            category: "atividade",
            source: "atividade" as any, // Marking as from "atividade" (or could add 'ai' enum later) to differentiate
          }))
        );
      }

      return { success: true, count: suggestedTasks.length };
    }),
});
