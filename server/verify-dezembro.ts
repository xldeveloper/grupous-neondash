/* biome-ignore-all lint/suspicious/noConsole: Verification CLI script - console is intentional */
import { and, eq } from "drizzle-orm";
import { mentorados, metricasMensais } from "../drizzle/schema";
import { getDb } from "./db";

async function verify() {
  const db = getDb();
  console.log("📊 Verifying December 2025 data...\n");

  const result = await db
    .select({
      nome: mentorados.nomeCompleto,
      faturamento: metricasMensais.faturamento,
      lucro: metricasMensais.lucro,
      leads: metricasMensais.leads,
    })
    .from(metricasMensais)
    .innerJoin(mentorados, eq(mentorados.id, metricasMensais.mentoradoId))
    .where(and(eq(metricasMensais.ano, 2025), eq(metricasMensais.mes, 12)));

  console.log("December 2025 metrics:");
  for (const r of result) {
    console.log(`  ${r.nome}: R$${r.faturamento} revenue | R$${r.lucro} profit | ${r.leads} leads`);
  }
  console.log(`\nTotal: ${result.length} December 2025 records`);
  process.exit(0);
}

verify();
