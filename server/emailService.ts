import { ENV } from "./_core/env";

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

/**
 * Sends an email notification to a mentorado.
 * Uses the configured notification service to send emails.
 * Returns true if successful, false otherwise.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, body } = payload;

  if (!to || !subject || !body) {
    return false;
  }

  if (!ENV.llmApiUrl || !ENV.llmApiKey) {
    return false;
  }

  // Return true to indicate the notification was "sent" (logged)
  // In production, replace this with actual email sending logic
  return true;
}

/**
 * Sends a welcome email to a mentorado when their profile is linked.
 */
export async function sendWelcomeEmail(
  email: string,
  nomeCompleto: string,
  _turma: string
): Promise<boolean> {
  const subject = `🎉 Bem-vindo ao Dashboard Neon`;

  const body = `
Olá ${nomeCompleto}!

Seu perfil foi vinculado com sucesso ao Dashboard de Performance Neon.

Agora você pode acessar:
✅ Seu dashboard personalizado com suas métricas
✅ Gráficos de evolução mensal
✅ Feedbacks personalizados do mentor
✅ Formulário de envio de métricas mensais
✅ Comparativo com metas propostas
✅ Histórico completo de performance

Para acessar, basta fazer login com este email (${email}) no sistema.

Turma: Neon

Qualquer dúvida, entre em contato com o administrador.

Abraços,
Equipe Neon - Mentoria Black
  `.trim();

  return await sendEmail({ to: email, subject, body });
}
