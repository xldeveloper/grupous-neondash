import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { playbookItems, playbookModules } from "../drizzle/schema";

const seedData = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  try {
    // --- NEON ESTRUTURA ---
    const [modEstrutura1] = await db
      .insert(playbookModules)
      .values({
        title: "Phase 1: Onboarding and Diagnosis",
        description: "First steps in the Neon Estrutura methodology.",
        order: 1,
        turma: "neon",
      })
      .returning();

    await db.insert(playbookItems).values([
      {
        moduleId: modEstrutura1.id,
        title: "Watch Inaugural Class",
        type: "video",
        order: 1,
        contentUrl: "https://vimeo.com/",
      },
      {
        moduleId: modEstrutura1.id,
        title: "Complete Initial Diagnosis",
        type: "link",
        order: 2,
        contentUrl: "https://typeform.com/",
      },
      {
        moduleId: modEstrutura1.id,
        title: "Set Revenue Goals",
        type: "task",
        order: 3,
      },
      {
        moduleId: modEstrutura1.id,
        title: "Set Up Social Media",
        type: "task",
        order: 4,
      },
    ]);

    const [modEstrutura2] = await db
      .insert(playbookModules)
      .values({
        title: "Phase 2: Financial Management",
        description: "Getting organized to grow.",
        order: 2,
        turma: "neon",
      })
      .returning();

    await db.insert(playbookItems).values([
      {
        moduleId: modEstrutura2.id,
        title: "Separate Personal and Business Accounts",
        type: "task",
        order: 1,
      },
      {
        moduleId: modEstrutura2.id,
        title: "Pricing Spreadsheet",
        type: "link",
        order: 2,
      },
      {
        moduleId: modEstrutura2.id,
        title: "Define Owner's Salary",
        type: "task",
        order: 3,
      },
    ]);

    // --- NEON ESCALA ---
    const [modEscala1] = await db
      .insert(playbookModules)
      .values({
        title: "Phase 1: Process Audit",
        description: "Where are the bottlenecks in your growth?",
        order: 1,
        turma: "neon",
      })
      .returning();

    await db.insert(playbookItems).values([
      {
        moduleId: modEscala1.id,
        title: "Customer Journey Mapping",
        type: "task",
        order: 1,
      },
      {
        moduleId: modEscala1.id,
        title: "LTV and CAC Analysis",
        type: "task",
        order: 2,
      },
      {
        moduleId: modEscala1.id,
        title: "Sales Scripts Review",
        type: "task",
        order: 3,
      },
    ]);
  } catch (_error) {
  } finally {
    // Close connection not strictly needed in serverless but good practice in logs
  }
};

seedData();
