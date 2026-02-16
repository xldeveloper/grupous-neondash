import { badges } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Seed default badges into database
 */
async function seedBadges() {
  const db = getDb();

  if (!db) {
    throw new Error("Failed to connect to database");
  }

  const defaultBadges = [
    // Revenue
    {
      codigo: "meta_faturamento",
      nome: "Goal Achieved",
      descricao: "Achieved the monthly revenue goal",
      icone: "Trophy",
      cor: "gold",
      categoria: "faturamento" as const,
      criterio: JSON.stringify({
        type: "faturamento",
        operator: ">=",
        target: "meta",
      }),
      pontos: 50,
    },
    {
      codigo: "super_faturamento",
      nome: "Super Performance",
      descricao: "Exceeded 150% of the revenue goal",
      icone: "Rocket",
      cor: "purple",
      categoria: "faturamento" as const,
      criterio: JSON.stringify({
        type: "faturamento",
        operator: ">=",
        target: "meta*1.5",
      }),
      pontos: 100,
    },
    // Content
    {
      codigo: "criador_conteudo",
      nome: "Content Creator",
      descricao: "Published all posts and stories for the month",
      icone: "Camera",
      cor: "blue",
      categoria: "conteudo" as const,
      criterio: JSON.stringify({
        type: "conteudo",
        operator: ">=",
        target: "meta",
      }),
      pontos: 30,
    },
    // Consistency
    {
      codigo: "consistente_3",
      nome: "Bronze Consistency",
      descricao: "Achieved the goal 3 consecutive months",
      icone: "Award",
      cor: "bronze",
      categoria: "consistencia" as const,
      criterio: JSON.stringify({ type: "streak", months: 3 }),
      pontos: 75,
    },
    {
      codigo: "consistente_6",
      nome: "Silver Consistency",
      descricao: "Achieved the goal 6 consecutive months",
      icone: "Medal",
      cor: "silver",
      categoria: "consistencia" as const,
      criterio: JSON.stringify({ type: "streak", months: 6 }),
      pontos: 150,
    },
    {
      codigo: "consistente_12",
      nome: "Gold Consistency",
      descricao: "Achieved the goal 12 consecutive months",
      icone: "Crown",
      cor: "gold",
      categoria: "consistencia" as const,
      criterio: JSON.stringify({ type: "streak", months: 12 }),
      pontos: 300,
    },
    // Operational
    {
      codigo: "leads_master",
      nome: "Leads Master",
      descricao: "Generated more than 100 leads in a month",
      icone: "Users",
      cor: "blue",
      categoria: "operacional" as const,
      criterio: JSON.stringify({ type: "leads", operator: ">=", value: 100 }),
      pontos: 40,
    },
    // Special
    {
      codigo: "primeiro_lugar",
      nome: "Champion of the Month",
      descricao: "Won 1st place in the monthly ranking",
      icone: "Star",
      cor: "gold",
      categoria: "especial" as const,
      criterio: JSON.stringify({ type: "ranking", position: 1 }),
      pontos: 100,
    },
  ];

  for (const badge of defaultBadges) {
    try {
      await db.insert(badges).values(badge).onConflictDoNothing({ target: badges.codigo });
    } catch (_error) {}
  }
}

/**
 * Main seed function
 */
async function main() {
  await seedBadges();
  process.exit(0);
}

main().catch((_error) => {
  process.exit(1);
});
