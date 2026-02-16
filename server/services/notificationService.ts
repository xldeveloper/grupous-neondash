/**
 * Notification Service
 * Handles dual-channel notifications (in-app + email) with graceful fallback.
 * Follows the service pattern from instagramService.ts.
 *
 * @module notificationService
 */

import { and, eq } from "drizzle-orm";
import {
  type InsertNotificacao,
  mentorados,
  metricasMensais,
  notificacoes,
} from "../../drizzle/schema";
import { createLogger, type Logger } from "../_core/logger";
import { getDb } from "../db";
import { type EmailTemplateName, getEmailTemplate, sendEmail } from "../emailService";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notification payload for dual-channel delivery
 */
export interface NotificationPayload {
  /** In-app notification title */
  title: string;
  /** In-app notification message */
  message: string;
  /** Email subject line */
  emailSubject: string;
  /** Email body (HTML or plain text) */
  emailBody: string;
}

/**
 * Notification type matching database enum
 */
export type TipoNotificacao = "lembrete_metricas" | "alerta_meta" | "conquista" | "ranking";

/**
 * Result of a dual-channel notification attempt
 */
export interface NotificationResult {
  /** Whether in-app notification was created */
  inAppSuccess: boolean;
  /** Whether email was sent successfully */
  emailSuccess: boolean;
  /** Error message if any step failed */
  error?: string;
  /** Created notification ID */
  notificationId?: number;
}

/**
 * Reminder type for metrics submission
 */
export type ReminderType = "day_1" | "day_3" | "day_6" | "day_11" | "manual";

/**
 * Summary of batch reminder operation
 */
export interface ReminderSummary {
  totalMentorados: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: Array<{ mentoradoId: number; error: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CORE NOTIFICATION FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send a dual-channel notification (in-app + email) with graceful fallback.
 * Creates in-app notification first, then attempts email. Email failure doesn't
 * prevent in-app notification from being created.
 *
 * @param mentoradoId - The mentorado to notify
 * @param tipo - Type of notification
 * @param payload - Notification content for both channels
 * @param logger - Optional logger instance
 * @returns NotificationResult with channel success statuses
 */
export async function sendDualNotification(
  mentoradoId: number,
  tipo: TipoNotificacao,
  payload: NotificationPayload,
  logger?: Logger
): Promise<NotificationResult> {
  const log = logger ?? createLogger({ service: "notification" });
  const db = getDb();

  try {
    // Step 1: Insert in-app notification
    const notificationData: InsertNotificacao = {
      mentoradoId,
      tipo,
      titulo: payload.title,
      mensagem: payload.message,
      enviadaPorEmail: "nao",
    };

    const [insertedNotification] = await db
      .insert(notificacoes)
      .values(notificationData)
      .returning({ id: notificacoes.id });

    const notificationId = insertedNotification.id;

    log.info("notification_created", {
      mentoradoId,
      tipo,
      notificationId,
    });

    // Step 2: Fetch mentorado email
    const [mentorado] = await db
      .select({ email: mentorados.email })
      .from(mentorados)
      .where(eq(mentorados.id, mentoradoId))
      .limit(1);

    if (!mentorado?.email) {
      log.info("email_skipped", {
        mentoradoId,
        reason: "No email address",
      });

      return {
        inAppSuccess: true,
        emailSuccess: false,
        notificationId,
        error: "Mentorado has no email address",
      };
    }

    // Step 3: Attempt email send
    let emailSuccess = false;
    try {
      emailSuccess = await sendEmail({
        to: mentorado.email,
        subject: payload.emailSubject,
        body: payload.emailBody,
      });

      if (emailSuccess) {
        // Step 4: Update notification record
        await db
          .update(notificacoes)
          .set({ enviadaPorEmail: "sim" })
          .where(eq(notificacoes.id, notificationId));

        log.info("email_sent", {
          mentoradoId,
          notificationId,
        });
      } else {
        log.warn("email_failed", null, {
          mentoradoId,
          notificationId,
          reason: "sendEmail returned false",
        });
      }
    } catch (emailError) {
      log.error("email_failed", emailError, {
        mentoradoId,
        notificationId,
      });
    }

    return {
      inAppSuccess: true,
      emailSuccess,
      notificationId,
    };
  } catch (error) {
    log.error("notification_failed", error, {
      mentoradoId,
      tipo,
    });

    return {
      inAppSuccess: false,
      emailSuccess: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED NOTIFICATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send a metrics reminder notification
 *
 * @param mentoradoId - Mentorado to remind
 * @param mes - Month for which metrics are due
 * @param ano - Year for which metrics are due
 * @param reminderType - Type of reminder (day_1, day_3, day_6, day_11, manual)
 * @param logger - Optional logger
 */
export async function sendMetricsReminder(
  mentoradoId: number,
  mes: number,
  ano: number,
  reminderType: ReminderType,
  logger?: Logger
): Promise<NotificationResult> {
  const log = logger ?? createLogger({ service: "notification" });
  const db = getDb();

  // Get mentorado name for personalization
  const [mentorado] = await db
    .select({ nomeCompleto: mentorados.nomeCompleto })
    .from(mentorados)
    .where(eq(mentorados.id, mentoradoId))
    .limit(1);

  const firstName = mentorado?.nomeCompleto.split(" ")[0] ?? "Mentee";

  // Get streak count for templates that use it
  let streakCount = 0;
  try {
    // Count consecutive months with metrics
    const metrics = await db
      .select({ mes: metricasMensais.mes, ano: metricasMensais.ano })
      .from(metricasMensais)
      .where(eq(metricasMensais.mentoradoId, mentoradoId))
      .orderBy(metricasMensais.ano, metricasMensais.mes);
    streakCount = metrics.length;
  } catch {
    // Ignore streak calculation errors
  }

  // Map reminder type to email template
  const templateMap: Record<ReminderType, EmailTemplateName> = {
    day_1: "metrics_reminder_day1",
    day_3: "metrics_reminder_day3",
    day_6: "metrics_reminder_day6",
    day_11: "metrics_reminder_day11",
    manual: "metrics_reminder_day1", // Manual uses day 1 template
  };

  const templateName = templateMap[reminderType];
  const emailHtml = getEmailTemplate(templateName, {
    firstName,
    mes,
    ano,
    streakCount,
  });

  // Title and message vary by reminder type
  const titleMap: Record<ReminderType, string> = {
    day_1: "🎯 New month! Time to record your metrics",
    day_3: "🔔 Reminder: Record your metrics by the 5th",
    day_6: "⚠️ Deadline approaching: Record today to keep your streak",
    day_11: "🔴 Last day to keep your streak! Record now",
    manual: "🔔 Reminder: Submit your metrics!",
  };

  const payload: NotificationPayload = {
    title: titleMap[reminderType],
    message: `Don't forget to submit your metrics for ${mes}/${ano}. Access the dashboard to record your performance.`,
    emailSubject: titleMap[reminderType],
    emailBody: emailHtml,
  };

  const result = await sendDualNotification(mentoradoId, "lembrete_metricas", payload, log);

  // Update lastMetricsReminder timestamp
  if (result.inAppSuccess) {
    await db
      .update(mentorados)
      .set({ lastMetricsReminder: new Date(), updatedAt: new Date() })
      .where(eq(mentorados.id, mentoradoId));

    log.info("reminder_sent", {
      mentoradoId,
      reminderType,
      mes,
      ano,
    });
  }

  return result;
}

/**
 * Send a badge unlocked notification
 *
 * @param mentoradoId - Mentorado who earned the badge
 * @param badgeNome - Name of the badge
 * @param badgeDescricao - Description of the badge
 * @param badgeIcone - Badge icon emoji
 * @param badgePontos - Points earned
 * @param logger - Optional logger
 */
export async function sendBadgeUnlocked(
  mentoradoId: number,
  badgeNome: string,
  badgeDescricao: string,
  badgeIcone: string,
  badgePontos: number,
  logger?: Logger
): Promise<NotificationResult> {
  const log = logger ?? createLogger({ service: "notification" });
  const db = getDb();

  // Get mentorado name for personalization
  const [mentorado] = await db
    .select({ nomeCompleto: mentorados.nomeCompleto })
    .from(mentorados)
    .where(eq(mentorados.id, mentoradoId))
    .limit(1);

  const firstName = mentorado?.nomeCompleto.split(" ")[0] ?? "Mentee";

  const emailHtml = getEmailTemplate("badge_unlocked", {
    firstName,
    badgeNome,
    badgeDescricao,
    badgeIcone,
    badgePontos,
  });

  const payload: NotificationPayload = {
    title: `🏆 Congratulations! You earned: ${badgeNome}`,
    message: badgeDescricao,
    emailSubject: `🏆 Congratulations! You earned a new badge: ${badgeNome}`,
    emailBody: emailHtml,
  };

  return sendDualNotification(mentoradoId, "conquista", payload, log);
}

/**
 * Send an Instagram reconnect notification
 *
 * @param mentoradoId - Mentorado who needs to reconnect
 * @param logger - Optional logger
 */
export async function sendInstagramReconnectNeeded(
  mentoradoId: number,
  logger?: Logger
): Promise<NotificationResult> {
  const log = logger ?? createLogger({ service: "notification" });
  const db = getDb();

  // Get mentorado name for personalization
  const [mentorado] = await db
    .select({ nomeCompleto: mentorados.nomeCompleto })
    .from(mentorados)
    .where(eq(mentorados.id, mentoradoId))
    .limit(1);

  const firstName = mentorado?.nomeCompleto.split(" ")[0] ?? "Mentee";

  const emailHtml = getEmailTemplate("instagram_reconnect", {
    firstName,
  });

  const payload: NotificationPayload = {
    title: "🔗 Reconnect your Instagram account",
    message:
      "Your Instagram token has expired. Reconnect your account to continue syncing your metrics automatically.",
    emailSubject: "🔗 Reconnect your Instagram account",
    emailBody: emailHtml,
  };

  return sendDualNotification(mentoradoId, "alerta_meta", payload, log);
}

// ═══════════════════════════════════════════════════════════════════════════
// SPAM CONTROL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if a reminder should be sent to a mentorado this month.
 * Returns false if:
 * - Reminder was already sent this month (lastMetricsReminder is this month)
 * - Mentorado already submitted metrics for this month
 *
 * @param mentoradoId - Mentorado to check
 * @param mes - Month to check
 * @param ano - Year to check
 * @param logger - Optional logger
 */
export async function shouldSendReminder(
  mentoradoId: number,
  mes: number,
  ano: number,
  logger?: Logger
): Promise<boolean> {
  const log = logger ?? createLogger({ service: "notification" });
  const db = getDb();

  try {
    // Check lastMetricsReminder
    const [mentorado] = await db
      .select({ lastMetricsReminder: mentorados.lastMetricsReminder })
      .from(mentorados)
      .where(eq(mentorados.id, mentoradoId))
      .limit(1);

    if (mentorado?.lastMetricsReminder) {
      const reminderMonth = mentorado.lastMetricsReminder.getMonth() + 1;
      const reminderYear = mentorado.lastMetricsReminder.getFullYear();

      if (reminderMonth === mes && reminderYear === ano) {
        log.info("spam_control_blocked", {
          mentoradoId,
          reason: "Already reminded this month",
        });
        return false;
      }
    }

    // Check if metrics already submitted for this month
    const [existingMetrics] = await db
      .select({ id: metricasMensais.id })
      .from(metricasMensais)
      .where(
        and(
          eq(metricasMensais.mentoradoId, mentoradoId),
          eq(metricasMensais.ano, ano),
          eq(metricasMensais.mes, mes)
        )
      )
      .limit(1);

    if (existingMetrics) {
      log.info("spam_control_blocked", {
        mentoradoId,
        reason: "Metrics already submitted",
      });
      return false;
    }

    return true;
  } catch (error) {
    log.error("spam_control_error", error, { mentoradoId });
    return false; // Err on the side of not spamming
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH REMINDER FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Send reminders to all active mentorados who haven't submitted metrics.
 * Uses spam control to avoid duplicate reminders.
 *
 * @param reminderType - Type of reminder to send
 * @returns Summary of batch operation
 */
export async function sendAllReminders(reminderType: ReminderType): Promise<ReminderSummary> {
  const logger = createLogger({ service: "notification", requestId: `batch-${reminderType}` });
  const db = getDb();

  logger.info("reminder_batch_start", { reminderType });

  // Get current month info (reminders are for the CURRENT month's metrics)
  const now = new Date();
  const currentMes = now.getMonth() + 1;
  const currentAno = now.getFullYear();

  // Get all active mentorados
  const activeMentorados = await db
    .select({ id: mentorados.id })
    .from(mentorados)
    .where(eq(mentorados.ativo, "sim"));

  const summary: ReminderSummary = {
    totalMentorados: activeMentorados.length,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Process each mentorado with fault tolerance
  const promises = activeMentorados.map(async (m) => {
    try {
      // Check spam control
      const shouldSend = await shouldSendReminder(m.id, currentMes, currentAno, logger);

      if (!shouldSend) {
        summary.skipped++;
        return;
      }

      // Send reminder
      const result = await sendMetricsReminder(m.id, currentMes, currentAno, reminderType, logger);

      if (result.inAppSuccess) {
        summary.sent++;
      } else {
        summary.failed++;
        summary.errors.push({
          mentoradoId: m.id,
          error: result.error ?? "Unknown error",
        });
      }
    } catch (error) {
      summary.failed++;
      summary.errors.push({
        mentoradoId: m.id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  await Promise.allSettled(promises);

  logger.info("reminder_batch_complete", {
    reminderType,
    ...summary,
    errors: summary.errors.slice(0, 5), // Log first 5 errors only
  });

  return summary;
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Notification service object with all public methods
 */
export const notificationService = {
  sendDualNotification,
  sendMetricsReminder,
  sendBadgeUnlocked,
  sendInstagramReconnectNeeded,
  shouldSendReminder,
  sendAllReminders,
};
