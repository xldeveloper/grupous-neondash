import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Mentorados table - extends users with profile info
 */
export const mentorados = mysqlTable("mentorados", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  nomeCompleto: varchar("nomeCompleto", { length: 255 }).notNull(),
  turma: mysqlEnum("turma", ["neon_estrutura", "neon_escala"]).notNull(),
  metaFaturamento: int("metaFaturamento").notNull().default(16000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Mentorado = typeof mentorados.$inferSelect;
export type InsertMentorado = typeof mentorados.$inferInsert;

/**
 * Monthly metrics table - stores performance data for each month
 */
export const metricasMensais = mysqlTable("metricas_mensais", {
  id: int("id").autoincrement().primaryKey(),
  mentoradoId: int("mentoradoId").notNull().references(() => mentorados.id, { onDelete: "cascade" }),
  ano: int("ano").notNull(),
  mes: int("mes").notNull(), // 1-12
  faturamento: int("faturamento").notNull().default(0),
  lucro: int("lucro").notNull().default(0),
  postsFeed: int("postsFeed").notNull().default(0),
  stories: int("stories").notNull().default(0),
  leads: int("leads").notNull().default(0),
  procedimentos: int("procedimentos").notNull().default(0),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MetricaMensal = typeof metricasMensais.$inferSelect;
export type InsertMetricaMensal = typeof metricasMensais.$inferInsert;

/**
 * Feedback/suggestions table - stores personalized monthly feedback
 */
export const feedbacks = mysqlTable("feedbacks", {
  id: int("id").autoincrement().primaryKey(),
  mentoradoId: int("mentoradoId").notNull().references(() => mentorados.id, { onDelete: "cascade" }),
  ano: int("ano").notNull(),
  mes: int("mes").notNull(),
  analiseMes: text("analiseMes").notNull(),
  focoProximoMes: text("focoProximoMes").notNull(),
  sugestaoMentor: text("sugestaoMentor").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Feedback = typeof feedbacks.$inferSelect;
export type InsertFeedback = typeof feedbacks.$inferInsert;