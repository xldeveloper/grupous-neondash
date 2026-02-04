/**
 * Seed script for initializing the 15 gamification badges
 *
 * This script populates the badges table with the Core Flows spec badges.
 * It uses onConflictDoNothing to prevent duplicate insertions (idempotent).
 *
 * Run with: bun run server/seeds/initializeBadges.ts
 */

import { badges } from "../../drizzle/schema";
import { createLogger } from "../_core/logger";
import { getDb } from "../db";
import { BADGES_CONFIG } from "../gamificacao";

const logger = createLogger({ service: "seeds/initializeBadges" });

/**
 * Initialize all 15 badges in the database
 * Uses onConflictDoNothing for idempotent execution
 */
export async function initializeBadges() {
  // getDb() throws on failure, no need for null check
  const db = getDb();

  logger.info("seed_started", { badgeCount: BADGES_CONFIG.length });

  try {
    // Batch insert for better performance (16 badges in one query)
    await db.insert(badges).values(BADGES_CONFIG).onConflictDoNothing();
    logger.info("badges_inserted", { count: BADGES_CONFIG.length });
  } catch (error) {
    logger.error("badges_insert_failed", error);
    throw error;
  }

  logger.info("seed_completed");
}

// Allow running as standalone script
if (import.meta.main) {
  initializeBadges()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error("seed_error", error);
      process.exit(1);
    });
}
