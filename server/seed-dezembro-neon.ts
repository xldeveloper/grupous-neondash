/* biome-ignore-all lint/suspicious/noConsole: Seed CLI script - console is intentional */
/**
 * December 2025 Data Seed for Neon PostgreSQL
 *
 * This script:
 * 1. Maps similar names between seed and existing database
 * 2. Inserts December 2025 metrics for existing mentees
 * 3. Creates new mentees for those not yet registered
 * 4. Inserts mentor feedbacks
 */

import { eq, ilike } from "drizzle-orm";
import { feedbacks, mentorados, metricasMensais } from "../drizzle/schema";
import { getDb } from "./db";

// December 2025 data from the original file
const dadosDezembro = {
  neon_estrutura: {
    "Ana Scaravate": {
      faturamento: 16000,
      lucro: 8000,
      postsFeed: 12,
      stories: 60,
      leads: 25,
      procedimentos: 18,
      feedback: {
        analiseMes:
          "Hit the revenue goal consistently. Good social media presence.",
        focoProximoMes: "Increase lead-to-procedure conversion",
        sugestaoMentor:
          "Implement a free evaluation campaign to attract new clients and strengthen relationships with existing leads.",
      },
    },
    "Tamara Martins": {
      faturamento: 12000,
      lucro: 6000,
      postsFeed: 8,
      stories: 40,
      leads: 15,
      procedimentos: 12,
      feedback: {
        analiseMes: "Revenue below target. Needs to increase content production.",
        focoProximoMes: "Increase digital presence and lead generation",
        sugestaoMentor:
          "Focus on active prospecting and create a more frequent posting routine to increase visibility.",
      },
    },
    "Élica Pires": {
      faturamento: 18000,
      lucro: 9000,
      postsFeed: 15,
      stories: 75,
      leads: 30,
      procedimentos: 22,
      feedback: {
        analiseMes: "Excellent performance! Exceeded the goal and maintained high productivity.",
        focoProximoMes: "Maintain the pace and explore upselling",
        sugestaoMentor:
          "Continue with the current strategy and implement premium packages to increase average ticket.",
      },
    },
    "Ana Cláudia": {
      faturamento: 14000,
      lucro: 7000,
      postsFeed: 10,
      stories: 50,
      leads: 20,
      procedimentos: 15,
      feedback: {
        analiseMes: "Close to the goal. Good operational consistency.",
        focoProximoMes: "Increase average procedure ticket",
        sugestaoMentor:
          "Work on selling combined protocols and complementary products to increase value per visit.",
      },
    },
    "Iza Nunes": {
      faturamento: 15000,
      lucro: 7500,
      postsFeed: 11,
      stories: 55,
      leads: 22,
      procedimentos: 16,
      feedback: {
        analiseMes: "Hit the goal with a healthy profit margin.",
        focoProximoMes: "Scale appointments without losing quality",
        sugestaoMentor:
          "Optimize your schedule and consider training an assistant to increase service capacity.",
      },
    },
  },
  neon_escala: {
    "Lana Máximo": {
      faturamento: 65000,
      lucro: 32500,
      postsFeed: 20,
      stories: 100,
      leads: 80,
      procedimentos: 60,
      feedback: {
        analiseMes: "Exceptional performance! Leadership in revenue and engagement.",
        focoProximoMes: "Consolidate processes for sustainable growth",
        sugestaoMentor:
          "Document your sales and service processes to replicate success in a scalable way.",
      },
    },
    "Thaís Olímpia": {
      faturamento: 95000,
      lucro: 47500,
      postsFeed: 25,
      stories: 120,
      leads: 100,
      procedimentos: 75,
      feedback: {
        analiseMes: "Best performance in the group! Excellence across all metrics.",
        focoProximoMes: "Maintain leadership and explore new niches",
        sugestaoMentor:
          "Explore strategic partnerships and consider launching a digital product to diversify revenue.",
      },
    },
    "Kleber Oliveira": {
      faturamento: 68000,
      lucro: 34000,
      postsFeed: 18,
      stories: 90,
      leads: 70,
      procedimentos: 55,
      feedback: {
        analiseMes: "Great revenue with good profit margin.",
        focoProximoMes: "Increase content frequency",
        sugestaoMentor:
          "Increase story production to 120+/month to maintain engagement and attract new leads.",
      },
    },
    "Jéssica Borges": {
      faturamento: 28000,
      lucro: 14000,
      postsFeed: 12,
      stories: 60,
      leads: 35,
      procedimentos: 25,
      feedback: {
        analiseMes: "Revenue below the Escala cohort potential.",
        focoProximoMes: "Intensify prospecting and increase average ticket",
        sugestaoMentor:
          "Implement a demand generation strategy with evaluation campaigns and focus on higher-value procedures.",
      },
    },
    "Carmen Lúcia": {
      faturamento: 65000,
      lucro: 32500,
      postsFeed: 19,
      stories: 95,
      leads: 75,
      procedimentos: 58,
      feedback: {
        analiseMes: "Excellent performance with balance between marketing and operations.",
        focoProximoMes: "Scale without losing quality",
        sugestaoMentor:
          "Build a support team to increase service capacity while maintaining quality standards.",
      },
    },
    "Alina Souza": {
      faturamento: 15000,
      lucro: 7500,
      postsFeed: 8,
      stories: 40,
      leads: 18,
      procedimentos: 12,
      feedback: {
        analiseMes: "Revenue well below expectations for the Escala cohort.",
        focoProximoMes: "Review full marketing and sales strategy",
        sugestaoMentor:
          "Prioritize active showcase with daily posts and consistent stories. Consider individual mentoring for course correction.",
      },
    },
    "Dra. Milena": {
      faturamento: 45000,
      lucro: 22500,
      postsFeed: 15,
      stories: 75,
      leads: 55,
      procedimentos: 40,
      feedback: {
        analiseMes: "Good performance with room for growth.",
        focoProximoMes: "Increase lead conversion",
        sugestaoMentor:
          "Implement a structured sales funnel with automated follow-up to improve conversion rate.",
      },
    },
    "Dra. Bruna": {
      faturamento: 38000,
      lucro: 19000,
      postsFeed: 14,
      stories: 70,
      leads: 45,
      procedimentos: 32,
      feedback: {
        analiseMes: "Solid performance with room for optimization.",
        focoProximoMes: "Increase average ticket and appointment frequency",
        sugestaoMentor:
          "Work on treatment packages and client retention to increase LTV (Lifetime Value).",
      },
    },
    "Dra. Jéssica": {
      faturamento: 32000,
      lucro: 16000,
      postsFeed: 13,
      stories: 65,
      leads: 40,
      procedimentos: 28,
      feedback: {
        analiseMes: "Average performance with growth potential.",
        focoProximoMes: "Increase digital presence and optimize conversion",
        sugestaoMentor:
          "Create an educational content strategy to position yourself as an authority and attract qualified leads.",
      },
    },
  },
};

// Name mapping (seed -> database)
// Based on name similarity between seed and current mentees
const nameMapping: Record<string, string> = {
  "Ana Scaravate": "Ana Mara Santos", // Similar (Ana)
  "Tamara Martins": "Enfa Tamara Dilma", // Similar (Tamara)
  "Élica Pires": "Elica Pereira", // Similar (Elica/Élica)
  "Iza Nunes": "Iza Rafaela Bezerra Pionório Freires", // Similar (Iza)
  // The remaining will be created as new mentees
};

async function findMentoradoByName(db: ReturnType<typeof getDb>, seedName: string) {
  // First try direct mapping
  const mappedName = nameMapping[seedName];
  if (mappedName) {
    const [found] = await db
      .select()
      .from(mentorados)
      .where(ilike(mentorados.nomeCompleto, `%${mappedName}%`))
      .limit(1);
    if (found) return found;
  }

  // Try similarity search
  const nameParts = seedName.split(" ");
  for (const part of nameParts) {
    if (part.length < 3) continue;
    const [found] = await db
      .select()
      .from(mentorados)
      .where(ilike(mentorados.nomeCompleto, `%${part}%`))
      .limit(1);
    if (found) return found;
  }

  return null;
}

async function createMentorado(
  db: ReturnType<typeof getDb>,
  nome: string,
  metaFaturamento: number
) {
  const [result] = await db
    .insert(mentorados)
    .values({
      nomeCompleto: nome,
      turma: "neon",
      metaFaturamento,
      ativo: "sim",
      onboardingCompleted: "nao",
    })
    .returning({ id: mentorados.id });
  return result.id;
}

async function insertMetricas(
  db: ReturnType<typeof getDb>,
  mentoradoId: number,
  dados: {
    faturamento: number;
    lucro: number;
    postsFeed: number;
    stories: number;
    leads: number;
    procedimentos: number;
  }
) {
  // Check if metrics already exist for this month
  const [existing] = await db
    .select()
    .from(metricasMensais)
    .where(eq(metricasMensais.mentoradoId, mentoradoId))
    .limit(1);

  if (existing) {
    // Update existing
    await db
      .update(metricasMensais)
      .set({
        faturamento: dados.faturamento,
        lucro: dados.lucro,
        postsFeed: dados.postsFeed,
        stories: dados.stories,
        leads: dados.leads,
        procedimentos: dados.procedimentos,
        updatedAt: new Date(),
      })
      .where(eq(metricasMensais.id, existing.id));
    return existing.id;
  }

  const [result] = await db
    .insert(metricasMensais)
    .values({
      mentoradoId,
      ano: 2025,
      mes: 12,
      faturamento: dados.faturamento,
      lucro: dados.lucro,
      postsFeed: dados.postsFeed,
      stories: dados.stories,
      leads: dados.leads,
      procedimentos: dados.procedimentos,
    })
    .returning({ id: metricasMensais.id });
  return result.id;
}

async function insertFeedback(
  db: ReturnType<typeof getDb>,
  mentoradoId: number,
  feedback: { analiseMes: string; focoProximoMes: string; sugestaoMentor: string }
) {
  // Check if feedback already exists
  const [existing] = await db
    .select()
    .from(feedbacks)
    .where(eq(feedbacks.mentoradoId, mentoradoId))
    .limit(1);

  if (existing) {
    await db
      .update(feedbacks)
      .set({
        analiseMes: feedback.analiseMes,
        focoProximoMes: feedback.focoProximoMes,
        sugestaoMentor: feedback.sugestaoMentor,
        updatedAt: new Date(),
      })
      .where(eq(feedbacks.id, existing.id));
    return existing.id;
  }

  const [result] = await db
    .insert(feedbacks)
    .values({
      mentoradoId,
      ano: 2025,
      mes: 12,
      analiseMes: feedback.analiseMes,
      focoProximoMes: feedback.focoProximoMes,
      sugestaoMentor: feedback.sugestaoMentor,
    })
    .returning({ id: feedbacks.id });
  return result.id;
}

export async function seedDezembroData() {
  const db = getDb();
  const results = {
    mapped: [] as string[],
    created: [] as string[],
    errors: [] as string[],
  };

  console.log("🌱 Starting December 2025 data seed...\n");

  // Process Neon Estrutura (goal: 16000)
  console.log("📊 Processing Neon Estrutura...");
  for (const [nome, dados] of Object.entries(dadosDezembro.neon_estrutura)) {
    try {
      const existingMentorado = await findMentoradoByName(db, nome);
      let mentoradoId: number;

      if (!existingMentorado) {
        mentoradoId = await createMentorado(db, nome, 16000);
        results.created.push(nome);
        console.log(`  ✨ Created: ${nome} (ID: ${mentoradoId})`);
      } else {
        mentoradoId = existingMentorado.id;
        results.mapped.push(`${nome} → ${existingMentorado.nomeCompleto}`);
        console.log(
          `  🔗 Mapped: ${nome} → ${existingMentorado.nomeCompleto} (ID: ${mentoradoId})`
        );
      }

      await insertMetricas(db, mentoradoId, dados);
      await insertFeedback(db, mentoradoId, dados.feedback);
      console.log(`  ✅ Metrics and feedback inserted for ${nome}`);
    } catch (error) {
      results.errors.push(`${nome}: ${error}`);
      console.error(`  ❌ Error processing ${nome}:`, error);
    }
  }

  // Process Neon Escala (goal: 50000)
  console.log("\n📊 Processing Neon Escala...");
  for (const [nome, dados] of Object.entries(dadosDezembro.neon_escala)) {
    try {
      const existingMentorado = await findMentoradoByName(db, nome);
      let mentoradoId: number;

      if (!existingMentorado) {
        mentoradoId = await createMentorado(db, nome, 50000);
        results.created.push(nome);
        console.log(`  ✨ Created: ${nome} (ID: ${mentoradoId})`);
      } else {
        mentoradoId = existingMentorado.id;
        results.mapped.push(`${nome} → ${existingMentorado.nomeCompleto}`);
        console.log(
          `  🔗 Mapped: ${nome} → ${existingMentorado.nomeCompleto} (ID: ${mentoradoId})`
        );
      }

      await insertMetricas(db, mentoradoId, dados);
      await insertFeedback(db, mentoradoId, dados.feedback);
      console.log(`  ✅ Metrics and feedback inserted for ${nome}`);
    } catch (error) {
      results.errors.push(`${nome}: ${error}`);
      console.error(`  ❌ Error processing ${nome}:`, error);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("📋 MIGRATION SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Mentees mapped: ${results.mapped.length}`);
  for (const m of results.mapped) {
    console.log(`   - ${m}`);
  }
  console.log(`\n✨ Mentees created: ${results.created.length}`);
  for (const m of results.created) {
    console.log(`   - ${m}`);
  }
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    for (const e of results.errors) {
      console.log(`   - ${e}`);
    }
  }
  console.log("=".repeat(60));

  return results;
}

// Run if executed directly
if (process.argv[1]?.includes("seed-dezembro-neon")) {
  seedDezembroData()
    .then((results) => {
      console.log("\n🎉 Migration complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Fatal error:", error);
      process.exit(1);
    });
}
