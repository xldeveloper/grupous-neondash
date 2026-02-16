/**
 * AI Assistant Service
 *
 * Uses Vercel AI SDK with Google Gemini to provide an intelligent assistant
 * with access to mentorado data via tool calling.
 */

import { generateText, tool } from "ai";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import {
  diagnosticos,
  feedbacks,
  googleTokens,
  leads,
  type Mentorado,
  metricasMensais,
  tasks,
} from "../../drizzle/schema";
import { defaultModel, isAIConfigured } from "../_core/aiProvider";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { getEvents, refreshAccessToken } from "./googleCalendarService";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatContext {
  mentorado: Mentorado;
  userId: number;
  mentoradoId: number;
}

export interface ChatResult {
  success: boolean;
  message: string;
  toolsUsed?: string[];
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPT = `You are the **NEON Assistant**, an AI assistant specializing in business mentorship for aesthetics professionals.

## Your Role
You help mentees of Dr. Camila's Black Mentorship track their progress, analyze metrics, and make strategic decisions to grow their businesses.

## Available Tools
You have access to the following tools to query mentee data:
- **getMyMetrics**: View monthly metrics (revenue, profit, leads, procedures, posts, stories)
- **getMyLeads**: View CRM leads with status filters
- **searchLeads**: Search leads by name, email, or phone
- **getLatestFeedback**: View the most recent mentor feedback
- **getMyTasks**: View pending tasks and their statuses
- **getMyGoals**: View current goals and progress
- **getDiagnostico**: View initial onboarding diagnosis
- **getMyAgenda**: View upcoming Google Calendar events
- **searchWeb**: Search the web for up-to-date information

## Guidelines
1. Always respond in **Brazilian Portuguese**
2. Be objective and provide **actionable insights**
3. Use real data when available - do not make up numbers
4. If there is no data, state that clearly
5. Suggest practical next steps based on the data
6. Use emojis sparingly to make the conversation more friendly
7. When analyzing metrics, compare with goals and previous months

## Formatting
Use markdown to format responses when appropriate:
- Lists for items
- **Bold** for emphasis
- Tables for comparisons
`;

// ═══════════════════════════════════════════════════════════════════════════
// TOOLS DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

function createTools(ctx: ChatContext) {
  const db = getDb();

  return {
    getMyMetrics: tool({
      description:
        "Get mentee's monthly metrics (revenue, profit, leads, procedures, posts, stories). Use to analyze performance.",
      parameters: z.object({
        months: z.number().min(1).max(12).default(6).describe("Number of months to fetch (1-12)"),
      }),
      execute: async ({ months }) => {
        const metrics = await db
          .select({
            ano: metricasMensais.ano,
            mes: metricasMensais.mes,
            faturamento: metricasMensais.faturamento,
            lucro: metricasMensais.lucro,
            leads: metricasMensais.leads,
            procedimentos: metricasMensais.procedimentos,
            postsFeed: metricasMensais.postsFeed,
            stories: metricasMensais.stories,
            observacoes: metricasMensais.observacoes,
          })
          .from(metricasMensais)
          .where(eq(metricasMensais.mentoradoId, ctx.mentoradoId))
          .orderBy(desc(metricasMensais.ano), desc(metricasMensais.mes))
          .limit(months);

        if (metrics.length === 0) {
          return { status: "empty", message: "No metrics recorded yet.", data: [] };
        }

        return {
          status: "success",
          message: `Found ${metrics.length} monthly metrics.`,
          data: metrics,
        };
      },
    }),

    getMyLeads: tool({
      description:
        "Get mentee's CRM leads. Can filter by status (novo, primeiro_contato, qualificado, proposta, negociacao, fechado, perdido).",
      parameters: z.object({
        status: z
          .enum([
            "novo",
            "primeiro_contato",
            "qualificado",
            "proposta",
            "negociacao",
            "fechado",
            "perdido",
          ])
          .optional()
          .describe("Filter by lead status"),
        limit: z.number().min(1).max(50).default(20).describe("Result limit"),
      }),
      execute: async ({ status, limit }) => {
        const conditions = [eq(leads.mentoradoId, ctx.mentoradoId)];
        if (status) {
          conditions.push(eq(leads.status, status));
        }

        const leadsList = await db
          .select({
            id: leads.id,
            nome: leads.nome,
            email: leads.email,
            telefone: leads.telefone,
            status: leads.status,
            origem: leads.origem,
            valorEstimado: leads.valorEstimado,
            temperatura: leads.temperatura,
            createdAt: leads.createdAt,
          })
          .from(leads)
          .where(and(...conditions))
          .orderBy(desc(leads.createdAt))
          .limit(limit);

        // Get count by status
        const allLeads = await db
          .select({ status: leads.status })
          .from(leads)
          .where(eq(leads.mentoradoId, ctx.mentoradoId));

        const statusCounts = allLeads.reduce<Record<string, number>>((acc, lead) => {
          acc[lead.status] = (acc[lead.status] || 0) + 1;
          return acc;
        }, {});

        return {
          status: "success",
          message: `Total: ${allLeads.length} leads, mostrando ${leadsList.length}.`,
          statusCounts,
          data: leadsList,
        };
      },
    }),

    searchLeads: tool({
      description: "Search leads by name, email, or phone.",
      parameters: z.object({
        query: z.string().min(2).describe("Search term (name, email, or phone)"),
      }),
      execute: async ({ query }) => {
        const searchTerm = `%${query}%`;
        const foundLeads = await db
          .select({
            id: leads.id,
            nome: leads.nome,
            email: leads.email,
            telefone: leads.telefone,
            status: leads.status,
            origem: leads.origem,
            valorEstimado: leads.valorEstimado,
          })
          .from(leads)
          .where(
            and(
              eq(leads.mentoradoId, ctx.mentoradoId),
              or(
                ilike(leads.nome, searchTerm),
                ilike(leads.email, searchTerm),
                ilike(leads.telefone ?? "", searchTerm)
              )
            )
          )
          .limit(10);

        return {
          status: foundLeads.length > 0 ? "success" : "empty",
          message:
            foundLeads.length > 0
              ? `Found ${foundLeads.length} leads for "${query}".`
              : `No leads found for "${query}".`,
          data: foundLeads,
        };
      },
    }),

    getLatestFeedback: tool({
      description: "Get the most recent mentor feedback about the mentee.",
      parameters: z.object({}),
      execute: async () => {
        const latestFeedback = await db
          .select({
            ano: feedbacks.ano,
            mes: feedbacks.mes,
            analiseMes: feedbacks.analiseMes,
            focoProximoMes: feedbacks.focoProximoMes,
            sugestaoMentor: feedbacks.sugestaoMentor,
            createdAt: feedbacks.createdAt,
          })
          .from(feedbacks)
          .where(eq(feedbacks.mentoradoId, ctx.mentoradoId))
          .orderBy(desc(feedbacks.ano), desc(feedbacks.mes))
          .limit(1);

        if (latestFeedback.length === 0) {
          return { status: "empty", message: "No feedback recorded yet.", data: null };
        }

        const fb = latestFeedback[0];
        return {
          status: "success",
          message: `Feedback de ${fb.mes}/${fb.ano}.`,
          data: fb,
        };
      },
    }),

    getMyTasks: tool({
      description: "Get mentee's tasks. Can filter by status (todo, done).",
      parameters: z.object({
        status: z.enum(["todo", "done"]).optional().describe("Filter by task status"),
      }),
      execute: async ({ status }) => {
        const conditions = [eq(tasks.mentoradoId, ctx.mentoradoId)];
        if (status) {
          conditions.push(eq(tasks.status, status));
        }

        const tasksList = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            category: tasks.category,
            priority: tasks.priority,
            createdAt: tasks.createdAt,
          })
          .from(tasks)
          .where(and(...conditions))
          .orderBy(desc(tasks.priority), tasks.createdAt);

        const todoCount = tasksList.filter((t: { status: string }) => t.status === "todo").length;
        const doneCount = tasksList.filter((t: { status: string }) => t.status === "done").length;

        return {
          status: "success",
          message: `Total: ${tasksList.length} tasks (${todoCount} pending, ${doneCount} completed).`,
          summary: { total: tasksList.length, todo: todoCount, done: doneCount },
          data: tasksList,
        };
      },
    }),

    getMyGoals: tool({
      description:
        "Get the mentee's current goals (revenue, leads, procedures, posts, stories).",
      parameters: z.object({}),
      execute: async () => {
        const mentorado = ctx.mentorado;

        // Get current month metrics to calculate progress
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const currentMetrics = await db
          .select({
            faturamento: metricasMensais.faturamento,
            leads: metricasMensais.leads,
            procedimentos: metricasMensais.procedimentos,
            postsFeed: metricasMensais.postsFeed,
            stories: metricasMensais.stories,
          })
          .from(metricasMensais)
          .where(
            and(
              eq(metricasMensais.mentoradoId, ctx.mentoradoId),
              eq(metricasMensais.ano, currentYear),
              eq(metricasMensais.mes, currentMonth)
            )
          )
          .limit(1);

        const metrics = currentMetrics[0] || {
          faturamento: 0,
          leads: 0,
          procedimentos: 0,
          postsFeed: 0,
          stories: 0,
        };

        const goals = {
          faturamento: {
            meta: mentorado.metaFaturamento,
            atual: metrics.faturamento,
            percentual: Math.round((metrics.faturamento / mentorado.metaFaturamento) * 100),
          },
          leads: {
            meta: mentorado.metaLeads,
            atual: metrics.leads,
            percentual: mentorado.metaLeads
              ? Math.round((metrics.leads / mentorado.metaLeads) * 100)
              : 0,
          },
          procedimentos: {
            meta: mentorado.metaProcedimentos,
            atual: metrics.procedimentos,
            percentual: mentorado.metaProcedimentos
              ? Math.round((metrics.procedimentos / mentorado.metaProcedimentos) * 100)
              : 0,
          },
          posts: {
            meta: mentorado.metaPosts,
            atual: metrics.postsFeed,
            percentual: mentorado.metaPosts
              ? Math.round((metrics.postsFeed / mentorado.metaPosts) * 100)
              : 0,
          },
          stories: {
            meta: mentorado.metaStories,
            atual: metrics.stories,
            percentual: mentorado.metaStories
              ? Math.round((metrics.stories / mentorado.metaStories) * 100)
              : 0,
          },
        };

        return {
          status: "success",
          message: `Goals for ${currentMonth}/${currentYear} for ${mentorado.nomeCompleto}.`,
          periodo: { ano: currentYear, mes: currentMonth },
          data: goals,
        };
      },
    }),

    getDiagnostico: tool({
      description:
        "Get the mentee's initial onboarding diagnosis (professional status, results, pain points, goals).",
      parameters: z.object({}),
      execute: async () => {
        const diag = await db
          .select({
            atuacaoSaude: diagnosticos.atuacaoSaude,
            tempoLivre: diagnosticos.tempoLivre,
            jaAtuaEstetica: diagnosticos.jaAtuaEstetica,
            temClinica: diagnosticos.temClinica,
            rendaMensal: diagnosticos.rendaMensal,
            faturaEstetica: diagnosticos.faturaEstetica,
            custoVida: diagnosticos.custoVida,
            incomodaRotina: diagnosticos.incomodaRotina,
            dificuldadeCrescer: diagnosticos.dificuldadeCrescer,
            objetivo6Meses: diagnosticos.objetivo6Meses,
            resultadoTransformador: diagnosticos.resultadoTransformador,
            organizacao: diagnosticos.organizacao,
          })
          .from(diagnosticos)
          .where(eq(diagnosticos.mentoradoId, ctx.mentoradoId))
          .limit(1);

        if (diag.length === 0) {
          return { status: "empty", message: "Diagnosis not completed yet.", data: null };
        }

        return {
          status: "success",
          message: "Mentee's initial diagnosis.",
          data: diag[0],
        };
      },
    }),

    getMyAgenda: tool({
      description:
        "Get user's upcoming Google Calendar events. Returns appointments, meetings, and reminders.",
      parameters: z.object({
        days: z
          .number()
          .min(1)
          .max(30)
          .default(7)
          .describe("Number of days ahead to fetch (1-30)"),
      }),
      execute: async ({ days }) => {
        // Check if user has Google Calendar connected
        const [token] = await db
          .select()
          .from(googleTokens)
          .where(eq(googleTokens.userId, ctx.userId));

        if (!token) {
          return {
            status: "not_connected",
            message:
              "Google Calendar not connected. The user needs to connect their Google account on the Calendar page.",
            data: null,
          };
        }

        // Check if token is expired and refresh if needed
        let accessToken = token.accessToken;
        if (new Date() >= token.expiresAt) {
          if (!token.refreshToken) {
            return {
              status: "expired",
              message:
                "Google Calendar session expired. The user needs to reconnect on the Calendar page.",
              data: null,
            };
          }

          try {
            const refreshed = await refreshAccessToken(token.refreshToken);
            accessToken = refreshed.access_token;

            // Update token in database
            await db
              .update(googleTokens)
              .set({
                accessToken: refreshed.access_token,
                expiresAt: new Date(Date.now() + refreshed.expires_in * 1000),
              })
              .where(eq(googleTokens.userId, ctx.userId));
          } catch {
            return {
              status: "refresh_failed",
              message:
                "Failed to refresh Google Calendar session. The user needs to reconnect on the Calendar page.",
              data: null,
            };
          }
        }

        // Fetch events
        try {
          const now = new Date();
          const timeMin = now;
          const timeMax = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

          const events = await getEvents(accessToken, timeMin, timeMax, 20);

          if (events.length === 0) {
            return {
              status: "empty",
              message: `No events found in the next ${days} days.`,
              data: [],
            };
          }

          return {
            status: "success",
            message: `Found ${events.length} events in the next ${days} days.`,
            data: events.map((e) => ({
              title: e.title,
              start: e.start,
              end: e.end,
              allDay: e.allDay,
              location: e.location,
            })),
          };
        } catch {
          return {
            status: "error",
            message: "Error fetching Google Calendar events.",
            data: null,
          };
        }
      },
    }),

    searchWeb: tool({
      description:
        "Search the web for up-to-date information using Brave Search. Use to find trends, news, or information not in the database.",
      parameters: z.object({
        query: z
          .string()
          .min(3)
          .max(200)
          .describe("Search term (e.g., 'aesthetics trends 2025', 'clinic marketing')"),
        count: z.number().min(1).max(10).default(5).describe("Number of results (1-10)"),
      }),
      execute: async ({ query, count }) => {
        if (!ENV.braveSearchApiKey) {
          return {
            status: "not_configured",
            message: "Web search not configured. BRAVE_SEARCH_API_KEY not set.",
            data: null,
          };
        }

        try {
          const response = await fetch(
            `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
            {
              headers: {
                Accept: "application/json",
                "Accept-Encoding": "gzip",
                "X-Subscription-Token": ENV.braveSearchApiKey,
              },
            }
          );

          if (!response.ok) {
            return {
              status: "error",
              message: `Search error: ${response.status} ${response.statusText}`,
              data: null,
            };
          }

          const data = (await response.json()) as {
            web?: {
              results?: Array<{
                title: string;
                url: string;
                description: string;
              }>;
            };
          };
          const results = data.web?.results ?? [];

          if (results.length === 0) {
            return {
              status: "empty",
              message: `No results found for "${query}".`,
              data: [],
            };
          }

          return {
            status: "success",
            message: `Found ${results.length} results for "${query}".`,
            data: results.map((r) => ({
              title: r.title,
              url: r.url,
              description: r.description,
            })),
          };
        } catch (error) {
          return {
            status: "error",
            message: `Search error: ${error instanceof Error ? error.message : "unknown"}`,
            data: null,
          };
        }
      },
    }),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CHAT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Process a chat message and generate a response using AI with tools.
 */
export async function chat(messages: AIMessage[], context: ChatContext): Promise<ChatResult> {
  if (!isAIConfigured()) {
    return {
      success: false,
      message:
        "AI service not configured. Set up GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_API_KEY.",
      error: "AI_NOT_CONFIGURED",
    };
  }

  try {
    const tools = createTools(context);

    const result = await generateText({
      model: defaultModel,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      tools,
      maxSteps: 5, // Allow up to 5 tool calls in a single request
    });

    const toolsUsed = result.steps
      .flatMap((step) => step.toolCalls?.map((tc) => tc.toolName) ?? [])
      .filter(Boolean);

    return {
      success: true,
      message: result.text,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
    };
  } catch (error) {
    // biome-ignore lint/suspicious/noConsole: Intentional error logging for debugging
    console.error("[AI Assistant] Error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle specific error types
    if (errorMessage.includes("API key")) {
      return {
        success: false,
        message: "AI API authentication error. Check the configuration.",
        error: "AUTH_ERROR",
      };
    }

    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      return {
        success: false,
        message: "Request limit reached. Please wait a few minutes.",
        error: "RATE_LIMIT",
      };
    }

    return {
      success: false,
      message: "Sorry, an error occurred while processing your message. Please try again.",
      error: errorMessage,
    };
  }
}

/**
 * Simple one-shot query for quick responses without conversation history.
 */
export async function query(prompt: string, context: ChatContext): Promise<ChatResult> {
  return chat([{ role: "user", content: prompt }], context);
}
