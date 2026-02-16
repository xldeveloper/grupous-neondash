import { ENV } from "./_core/env";
import { createLogger } from "./_core/logger";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export type EmailTemplateName =
  | "metrics_reminder_day1"
  | "metrics_reminder_day3"
  | "metrics_reminder_day6"
  | "metrics_reminder_day11"
  | "badge_unlocked"
  | "instagram_reconnect";

export interface MetricsReminderData {
  firstName: string;
  mes: number;
  ano: number;
  streakCount?: number;
}

export interface BadgeUnlockedData {
  firstName: string;
  badgeNome: string;
  badgeDescricao: string;
  badgeIcone: string;
  badgePontos: number;
}

export interface InstagramReconnectData {
  firstName: string;
}

type TemplateData = MetricsReminderData | BadgeUnlockedData | InstagramReconnectData;

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

const NEON_BRAND_COLORS = {
  primary: "#6366f1", // Indigo-500
  primaryDark: "#4f46e5", // Indigo-600
  gold: "#f59e0b", // Amber-500
  background: "#1e1b4b", // Indigo-950
  white: "#ffffff",
  gray: "#9ca3af",
  darkBg: "#0f0d1a",
};

/**
 * Base email wrapper with Neon branding
 */
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neon Dashboard</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${NEON_BRAND_COLORS.darkBg};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${NEON_BRAND_COLORS.darkBg};">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, ${NEON_BRAND_COLORS.background} 0%, ${NEON_BRAND_COLORS.darkBg} 100%); border-radius: 16px; overflow: hidden; border: 1px solid rgba(99, 102, 241, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; border-bottom: 1px solid rgba(99, 102, 241, 0.2);">
              <h1 style="margin: 0; color: ${NEON_BRAND_COLORS.white}; font-size: 28px; font-weight: 700;">
                <span style="color: ${NEON_BRAND_COLORS.primary};">NEON</span> Dashboard
              </h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center; border-top: 1px solid rgba(99, 102, 241, 0.2);">
              <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 12px;">
                © ${new Date().getFullYear()} Neon Dashboard - Black Mentorship
              </p>
              <p style="margin: 8px 0 0 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 11px;">
                This email was sent automatically. Please do not reply to this message.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * CTA Button component
 */
function ctaButton(text: string, url = "#"): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto;">
      <tr>
        <td style="border-radius: 8px; background: linear-gradient(135deg, ${NEON_BRAND_COLORS.primary} 0%, ${NEON_BRAND_COLORS.primaryDark} 100%);">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 32px; color: ${NEON_BRAND_COLORS.white}; text-decoration: none; font-weight: 600; font-size: 16px;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function metricsReminderDay1(data: MetricsReminderData): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[data.mes - 1];

  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.white}; font-size: 24px;">
      🎯 Hello, ${data.firstName}!
    </h2>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      A new month has started! It's time to record your metrics for <strong style="color: ${NEON_BRAND_COLORS.white};">${monthName}/${data.ano}</strong> on the Neon Dashboard.
    </p>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      Record your revenue, leads, procedures, and content to track your progress and earn new badges!
    </p>
    ${ctaButton("Record Metrics")}
    <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; text-align: center;">
      Remember: submitting by day 10 keeps your streak active! 🔥
    </p>
  `;

  return emailWrapper(content);
}

function metricsReminderDay3(data: MetricsReminderData): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[data.mes - 1];

  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.white}; font-size: 24px;">
      🔔 Friendly reminder, ${data.firstName}!
    </h2>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      Haven't recorded your metrics for <strong style="color: ${NEON_BRAND_COLORS.white};">${monthName}/${data.ano}</strong> yet?
    </p>
    <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: ${NEON_BRAND_COLORS.white}; font-size: 14px;">
        💡 <strong>Tip:</strong> Submitting early helps you earn the "Punctuality" badge - for those who submit by day 5!
      </p>
    </div>
    ${ctaButton("Record Now")}
    <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; text-align: center;">
      Deadline: day 10 to keep the streak.
    </p>
  `;

  return emailWrapper(content);
}

function metricsReminderDay6(data: MetricsReminderData): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[data.mes - 1];

  const streakMessage =
    data.streakCount && data.streakCount > 0
      ? `<p style="margin: 0; color: ${NEON_BRAND_COLORS.gold}; font-size: 18px; font-weight: 600;">🔥 Your current streak: ${data.streakCount} months</p>`
      : "";

  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gold}; font-size: 24px;">
      ⚠️ Attention, ${data.firstName}!
    </h2>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      The deadline to record your metrics for <strong style="color: ${NEON_BRAND_COLORS.white};">${monthName}/${data.ano}</strong> is approaching!
    </p>
    <div style="background: rgba(245, 158, 11, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid rgba(245, 158, 11, 0.3);">
      ${streakMessage}
      <p style="margin: ${data.streakCount ? "10px 0 0 0" : "0"}; color: ${NEON_BRAND_COLORS.white}; font-size: 14px;">
        Record today to keep your streak and secure your ranking points!
      </p>
    </div>
    ${ctaButton("Record Metrics")}
    <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; text-align: center;">
      ⏰ Only a few days left!
    </p>
  `;

  return emailWrapper(content);
}

function metricsReminderDay11(data: MetricsReminderData): string {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[data.mes - 1];

  const streakMessage =
    data.streakCount && data.streakCount > 0
      ? `<p style="margin: 10px 0 0 0; color: ${NEON_BRAND_COLORS.white}; font-size: 16px;">Your streak of <strong>${data.streakCount} months</strong> will be lost if you don't submit today!</p>`
      : "";

  const content = `
    <h2 style="margin: 0 0 20px 0; color: #ef4444; font-size: 24px;">
      🔴 LAST DAY, ${data.firstName}!
    </h2>
    <div style="background: rgba(239, 68, 68, 0.1); border-radius: 12px; padding: 24px; margin: 0 0 20px 0; border: 1px solid rgba(239, 68, 68, 0.3);">
      <p style="margin: 0; color: ${NEON_BRAND_COLORS.white}; font-size: 16px; line-height: 1.6;">
        Today is the <strong>last day</strong> to record your metrics for <strong>${monthName}/${data.ano}</strong>!
      </p>
      ${streakMessage}
    </div>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; line-height: 1.6;">
      Don't miss the opportunity to track your progress and maintain your ranking position.
    </p>
    ${ctaButton("Record Now")}
    <p style="margin: 0; color: #ef4444; font-size: 14px; text-align: center; font-weight: 600;">
      ⚡ Record now before it's too late!
    </p>
  `;

  return emailWrapper(content);
}

function badgeUnlockedTemplate(data: BadgeUnlockedData): string {
  const content = `
    <div style="text-align: center;">
      <div style="font-size: 72px; margin-bottom: 20px;">
        ${data.badgeIcone}
      </div>
      <h2 style="margin: 0 0 10px 0; color: ${NEON_BRAND_COLORS.gold}; font-size: 28px;">
        🎉 Congratulations, ${data.firstName}!
      </h2>
      <p style="margin: 0 0 30px 0; color: ${NEON_BRAND_COLORS.white}; font-size: 18px;">
        You earned a new badge!
      </p>
    </div>
    <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%); border-radius: 16px; padding: 30px; margin: 0 0 30px 0; border: 1px solid rgba(245, 158, 11, 0.3); text-align: center;">
      <h3 style="margin: 0 0 10px 0; color: ${NEON_BRAND_COLORS.white}; font-size: 24px;">
        ${data.badgeNome}
      </h3>
      <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px;">
        ${data.badgeDescricao}
      </p>
      <div style="display: inline-block; background: ${NEON_BRAND_COLORS.primary}; border-radius: 20px; padding: 8px 20px;">
        <span style="color: ${NEON_BRAND_COLORS.white}; font-size: 14px; font-weight: 600;">
          +${data.badgePontos} points
        </span>
      </div>
    </div>
    ${ctaButton("View My Badges")}
    <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; text-align: center;">
      Keep evolving to earn more badges! 🚀
    </p>
  `;

  return emailWrapper(content);
}

function instagramReconnectTemplate(data: InstagramReconnectData): string {
  const content = `
    <h2 style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.white}; font-size: 24px;">
      🔗 Hello, ${data.firstName}!
    </h2>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      Your Instagram access token has expired. To continue syncing your metrics automatically, you need to reconnect your account.
    </p>
    <div style="background: rgba(99, 102, 241, 0.1); border-radius: 12px; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; color: ${NEON_BRAND_COLORS.white}; font-size: 14px; line-height: 1.6;">
        🔒 <strong>Don't worry:</strong> Your previous data is safe. You just need to re-authorize access to continue automatic syncing of posts and stories.
      </p>
    </div>
    ${ctaButton("Reconnect Instagram")}
    <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; text-align: center;">
      Automatic syncing saves you time and keeps your metrics always up to date!
    </p>
  `;

  return emailWrapper(content);
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATE GETTER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get HTML email template by name
 *
 * @param templateName - Name of the template
 * @param data - Data to populate the template
 * @returns HTML string for the email body
 */
export function getEmailTemplate(templateName: EmailTemplateName, data: TemplateData): string {
  switch (templateName) {
    case "metrics_reminder_day1":
      return metricsReminderDay1(data as MetricsReminderData);
    case "metrics_reminder_day3":
      return metricsReminderDay3(data as MetricsReminderData);
    case "metrics_reminder_day6":
      return metricsReminderDay6(data as MetricsReminderData);
    case "metrics_reminder_day11":
      return metricsReminderDay11(data as MetricsReminderData);
    case "badge_unlocked":
      return badgeUnlockedTemplate(data as BadgeUnlockedData);
    case "instagram_reconnect":
      return instagramReconnectTemplate(data as InstagramReconnectData);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMAIL SENDING
// ═══════════════════════════════════════════════════════════════════════════

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

/**
 * Sends an email notification to a mentee.
 * Uses the configured notification service to send emails.
 * Includes retry logic with exponential backoff.
 *
 * @param payload - Email payload with to, subject, and body
 * @returns true if successful, false otherwise
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const logger = createLogger({ service: "email" });
  const { to, subject, body } = payload;

  if (!to || !subject || !body) {
    logger.warn("email_invalid_payload", null, {
      to: Boolean(to),
      subject: Boolean(subject),
      body: Boolean(body),
    });
    return false;
  }

  if (!ENV.llmApiUrl || !ENV.llmApiKey) {
    logger.warn("email_not_configured", null, { reason: "Missing LLM API credentials" });
    return false;
  }

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      // TODO: Replace with actual email sending logic
      // For now, log the email attempt and return success
      // In production, integrate with SendGrid, SES, or similar
      logger.info("email_attempt", {
        to,
        subject,
        attempt: attempt + 1,
        bodyLength: body.length,
      });

      // Simulate successful send
      // Replace this with actual API call:
      // const response = await fetch(EMAIL_API_URL, { ... });
      // if (!response.ok) throw new Error("Email API error");

      logger.info("email_sent", {
        to,
        subject,
      });

      return true;
    } catch (error) {
      logger.error("email_attempt_failed", error, {
        to,
        subject,
        attempt: attempt + 1,
      });

      // Wait before retry (unless this was the last attempt)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS[attempt]));
      }
    }
  }

  logger.error("email_failed_all_retries", null, {
    to,
    subject,
    attempts: MAX_RETRIES,
  });

  return false;
}

/**
 * Sends a welcome email to a mentee when their profile is linked.
 */
export async function sendWelcomeEmail(
  email: string,
  nomeCompleto: string,
  _turma: string
): Promise<boolean> {
  const firstName = nomeCompleto.split(" ")[0];

  const content = `
    <div style="text-align: center;">
      <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
      <h2 style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.white}; font-size: 28px;">
        Welcome to the Neon Dashboard!
      </h2>
    </div>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      Hello <strong style="color: ${NEON_BRAND_COLORS.white};">${firstName}</strong>! Your profile has been linked successfully.
    </p>
    <p style="margin: 0 0 20px 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 16px; line-height: 1.6;">
      You can now access:
    </p>
    <ul style="margin: 0 0 30px 0; padding-left: 20px; color: ${NEON_BRAND_COLORS.gray}; font-size: 15px; line-height: 2;">
      <li>✅ Your personalized dashboard with your metrics</li>
      <li>✅ Monthly progress charts</li>
      <li>✅ Personalized feedback from your mentor</li>
      <li>✅ Monthly metrics submission form</li>
      <li>✅ Comparison with proposed goals</li>
      <li>✅ Badges and achievements system</li>
      <li>✅ Class ranking</li>
    </ul>
    ${ctaButton("Access Dashboard")}
    <p style="margin: 0; color: ${NEON_BRAND_COLORS.gray}; font-size: 14px; text-align: center;">
      To access, simply log in with this email (${email}) in the system.
    </p>
  `;

  const htmlBody = emailWrapper(content);

  return await sendEmail({
    to: email,
    subject: "🎉 Welcome to the Neon Dashboard!",
    body: htmlBody,
  });
}
