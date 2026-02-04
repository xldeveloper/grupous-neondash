import { relations } from "drizzle-orm";
import {
  aiAgentConfig,
  badges,
  callNotes,
  feedbacks,
  instagramSyncLog,
  instagramTokens,
  interacoes,
  leads,
  mentoradoBadges,
  mentorados,
  metasProgressivas,
  metricasMensais,
  notificacoes,
  rankingMensal,
  users,
  weeklyPlanProgress,
  weeklyPlans,
  whatsappMessages,
} from "./schema";

// ═══════════════════════════════════════════════════════════════════════════
// USER RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const usersRelations = relations(users, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [users.id],
    references: [mentorados.userId],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// MENTORADO RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const mentoradosRelations = relations(mentorados, ({ one, many }) => ({
  user: one(users, {
    fields: [mentorados.userId],
    references: [users.id],
  }),
  metricas: many(metricasMensais),
  feedbacks: many(feedbacks),
  badges: many(mentoradoBadges),
  rankings: many(rankingMensal),
  metasProgressivas: many(metasProgressivas),
  notificacoes: many(notificacoes),
  leads: many(leads),
  interacoes: many(interacoes),
  // Instagram Integration
  instagramTokens: one(instagramTokens),
  instagramSyncLogs: many(instagramSyncLog),
  // Call Notes
  callNotes: many(callNotes),
  // Weekly Planning
  weeklyPlans: many(weeklyPlans),
  weeklyPlanProgress: many(weeklyPlanProgress),
}));

// ═══════════════════════════════════════════════════════════════════════════
// METRICAS MENSAIS RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const metricasMensaisRelations = relations(metricasMensais, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [metricasMensais.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// FEEDBACKS RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [feedbacks.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// BADGES RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const badgesRelations = relations(badges, ({ many }) => ({
  mentoradoBadges: many(mentoradoBadges),
}));

// ═══════════════════════════════════════════════════════════════════════════
// MENTORADO BADGES RELATIONS (Junction Table)
// ═══════════════════════════════════════════════════════════════════════════

export const mentoradoBadgesRelations = relations(mentoradoBadges, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [mentoradoBadges.mentoradoId],
    references: [mentorados.id],
  }),
  badge: one(badges, {
    fields: [mentoradoBadges.badgeId],
    references: [badges.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// RANKING MENSAL RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const rankingMensalRelations = relations(rankingMensal, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [rankingMensal.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// METAS PROGRESSIVAS RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const metasProgressivasRelations = relations(metasProgressivas, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [metasProgressivas.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICACOES RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const notificacoesRelations = relations(notificacoes, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [notificacoes.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// LEADS RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const leadsRelations = relations(leads, ({ one, many }) => ({
  mentorado: one(mentorados, {
    fields: [leads.mentoradoId],
    references: [mentorados.id],
  }),
  interacoes: many(interacoes),
}));

// ═══════════════════════════════════════════════════════════════════════════
// INTERACOES RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const interacoesRelations = relations(interacoes, ({ one }) => ({
  lead: one(leads, {
    fields: [interacoes.leadId],
    references: [leads.id],
  }),
  mentorado: one(mentorados, {
    fields: [interacoes.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// WHATSAPP MESSAGES RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const whatsappMessagesRelations = relations(whatsappMessages, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [whatsappMessages.mentoradoId],
    references: [mentorados.id],
  }),
  lead: one(leads, {
    fields: [whatsappMessages.leadId],
    references: [leads.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// AI AGENT CONFIG RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const aiAgentConfigRelations = relations(aiAgentConfig, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [aiAgentConfig.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// INSTAGRAM TOKENS RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const instagramTokensRelations = relations(instagramTokens, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [instagramTokens.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// INSTAGRAM SYNC LOG RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const instagramSyncLogRelations = relations(instagramSyncLog, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [instagramSyncLog.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// CALL NOTES RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const callNotesRelations = relations(callNotes, ({ one }) => ({
  mentorado: one(mentorados, {
    fields: [callNotes.mentoradoId],
    references: [mentorados.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════════
// WEEKLY PLANNING RELATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const weeklyPlansRelations = relations(weeklyPlans, ({ one, many }) => ({
  mentorado: one(mentorados, {
    fields: [weeklyPlans.mentoradoId],
    references: [mentorados.id],
  }),
  createdByUser: one(users, {
    fields: [weeklyPlans.createdBy],
    references: [users.id],
  }),
  progress: many(weeklyPlanProgress),
}));

export const weeklyPlanProgressRelations = relations(weeklyPlanProgress, ({ one }) => ({
  plan: one(weeklyPlans, {
    fields: [weeklyPlanProgress.planId],
    references: [weeklyPlans.id],
  }),
  mentorado: one(mentorados, {
    fields: [weeklyPlanProgress.mentoradoId],
    references: [mentorados.id],
  }),
}));
