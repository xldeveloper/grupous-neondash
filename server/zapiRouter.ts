/**
 * Z-API tRPC Router
 * Handles WhatsApp connection management and messaging
 */
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { mentorados, whatsappMessages } from "../drizzle/schema";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { encrypt, safeDecrypt } from "./services/crypto";
import { type ZApiCredentials, zapiService } from "./services/zapiService";

/**
 * Get mentorado with Z-API credentials
 */
async function getMentoradoWithZapi(userId: number) {
  const db = getDb();
  const [mentorado] = await db
    .select()
    .from(mentorados)
    .where(eq(mentorados.userId, userId))
    .limit(1);

  return mentorado ?? null;
}

/**
 * Build Z-API credentials from mentorado data
 */
function buildCredentials(mentorado: {
  zapiInstanceId: string | null;
  zapiToken: string | null;
  zapiClientToken?: string | null;
}): ZApiCredentials | null {
  if (!mentorado.zapiInstanceId || !mentorado.zapiToken) {
    return null;
  }

  const decryptedToken = safeDecrypt(mentorado.zapiToken);
  if (!decryptedToken) {
    return null;
  }

  // Decrypt client token (account security token) if present
  const decryptedClientToken = mentorado.zapiClientToken
    ? safeDecrypt(mentorado.zapiClientToken)
    : undefined;

  return {
    instanceId: mentorado.zapiInstanceId,
    token: decryptedToken,
    clientToken: decryptedClientToken ?? undefined,
  };
}

export const zapiRouter = router({
  /**
   * Get current WhatsApp connection status
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const mentorado = await getMentoradoWithZapi(ctx.user.id);
    if (!mentorado) {
      return { configured: false, connected: false };
    }

    const credentials = buildCredentials(mentorado);
    if (!credentials) {
      return { configured: false, connected: false };
    }

    const status = await zapiService.getConnectionStatus(credentials);

    // Update connection status in DB if changed
    const isConnected = status.connected ? "sim" : "nao";
    if (mentorado.zapiConnected !== isConnected) {
      const db = getDb();
      await db
        .update(mentorados)
        .set({
          zapiConnected: isConnected,
          zapiConnectedAt: status.connected ? new Date() : null,
          zapiPhone: status.phoneNumber ?? mentorado.zapiPhone,
          updatedAt: new Date(),
        })
        .where(eq(mentorados.id, mentorado.id));
    }

    return {
      configured: true,
      connected: status.connected,
      phone: status.phoneNumber ?? mentorado.zapiPhone,
      error: status.error,
    };
  }),

  /**
   * Configure Z-API credentials
   */
  configure: protectedProcedure
    .input(
      z.object({
        instanceId: z.string().min(1, "Instance ID is required"),
        token: z.string().min(1, "Token is required"),
        clientToken: z.string().optional(), // Account Security Token (optional)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentorado = await getMentoradoWithZapi(ctx.user.id);
      if (!mentorado) {
        throw new Error("Mentee not found");
      }

      // Encrypt tokens before storing
      const encryptedToken = encrypt(input.token);
      const encryptedClientToken = input.clientToken ? encrypt(input.clientToken) : null;

      const db = getDb();
      await db
        .update(mentorados)
        .set({
          zapiInstanceId: input.instanceId,
          zapiToken: encryptedToken,
          zapiClientToken: encryptedClientToken,
          zapiConnected: "nao",
          updatedAt: new Date(),
        })
        .where(eq(mentorados.id, mentorado.id));

      return { success: true };
    }),

  /**
   * Get QR code for WhatsApp connection
   */
  getQRCode: protectedProcedure.query(async ({ ctx }) => {
    const mentorado = await getMentoradoWithZapi(ctx.user.id);
    if (!mentorado) {
      throw new Error("Mentee not found");
    }

    const credentials = buildCredentials(mentorado);
    if (!credentials) {
      throw new Error("Z-API not configured. Set up credentials first.");
    }

    const qrResponse = await zapiService.getQRCode(credentials);

    // Validate QR code response
    if (!qrResponse.value) {
      // If connected, QR code won't be generated
      if (qrResponse.connected) {
        return {
          qrCode: null,
          connected: true,
        };
      }
      throw new Error("Z-API did not return the QR Code. Check if the instance is active.");
    }

    return {
      qrCode: qrResponse.value,
      connected: qrResponse.connected,
    };
  }),

  /**
   * Disconnect WhatsApp session
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    const mentorado = await getMentoradoWithZapi(ctx.user.id);
    if (!mentorado) {
      throw new Error("Mentee not found");
    }

    const credentials = buildCredentials(mentorado);
    if (!credentials) {
      throw new Error("Z-API not configured");
    }

    await zapiService.disconnect(credentials);

    const db = getDb();
    await db
      .update(mentorados)
      .set({
        zapiConnected: "nao",
        updatedAt: new Date(),
      })
      .where(eq(mentorados.id, mentorado.id));

    return { success: true };
  }),

  /**
   * Send a WhatsApp message
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(8, "Invalid phone number"),
        message: z.string().min(1, "Message cannot be empty"),
        leadId: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const mentorado = await getMentoradoWithZapi(ctx.user.id);
      if (!mentorado) {
        throw new Error("Mentee not found");
      }

      const credentials = buildCredentials(mentorado);
      if (!credentials) {
        throw new Error("Z-API not configured");
      }

      // Send message via Z-API
      const response = await zapiService.sendTextMessage(credentials, {
        phone: input.phone,
        message: input.message,
      });

      // Store message in DB
      const db = getDb();
      const [savedMessage] = await db
        .insert(whatsappMessages)
        .values({
          mentoradoId: mentorado.id,
          leadId: input.leadId ?? null,
          phone: input.phone,
          direction: "outbound",
          content: input.message,
          zapiMessageId: response.zapiMessageId ?? response.id,
          status: "sent",
          isFromAi: "nao",
        })
        .returning();

      return {
        success: true,
        messageId: savedMessage?.id,
        zapiMessageId: response.zapiMessageId,
      };
    }),

  /**
   * Get message history for a lead or phone number
   */
  getMessages: protectedProcedure
    .input(
      z.object({
        leadId: z.number().optional(),
        phone: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const mentorado = await getMentoradoWithZapi(ctx.user.id);
      if (!mentorado) {
        return [];
      }

      // Build query conditions
      const conditions = [eq(whatsappMessages.mentoradoId, mentorado.id)];

      if (input.leadId) {
        conditions.push(eq(whatsappMessages.leadId, input.leadId));
      } else if (input.phone) {
        // Normalize phone for comparison
        const normalizedPhone = zapiService.normalizePhoneNumber(input.phone);
        conditions.push(eq(whatsappMessages.phone, normalizedPhone));
      }

      const db = getDb();
      const messages = await db
        .select()
        .from(whatsappMessages)
        .where(and(...conditions))
        .orderBy(desc(whatsappMessages.createdAt))
        .limit(input.limit);

      return messages.reverse(); // Return in chronological order
    }),

  /**
   * Get unread message count per lead
   */
  getUnreadCounts: protectedProcedure.query(async ({ ctx }) => {
    const mentorado = await getMentoradoWithZapi(ctx.user.id);
    if (!mentorado) {
      return {};
    }

    // Get all inbound messages that haven't been "seen"
    // For now, simple count per lead
    const db = getDb();
    const messages = await db
      .select({
        leadId: whatsappMessages.leadId,
      })
      .from(whatsappMessages)
      .where(
        and(
          eq(whatsappMessages.mentoradoId, mentorado.id),
          eq(whatsappMessages.direction, "inbound")
        )
      );

    // Count messages per lead
    const counts: Record<number, number> = {};
    for (const msg of messages) {
      if (msg.leadId) {
        counts[msg.leadId] = (counts[msg.leadId] ?? 0) + 1;
      }
    }

    return counts;
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATOR API PROCEDURES
  // For managing instances via the Z-API Integrator Partner program
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if integrator mode is available
   */
  isIntegratorAvailable: protectedProcedure.query(() => {
    return { available: zapiService.isIntegratorModeAvailable() };
  }),

  /**
   * Create and connect a new instance (one-click flow)
   * This provision a new Z-API instance and automatically configures it
   */
  createAndConnectInstance: protectedProcedure.mutation(async ({ ctx }) => {
    const mentorado = await getMentoradoWithZapi(ctx.user.id);
    if (!mentorado) {
      throw new Error("Mentee not found");
    }

    // Check if already has an active instance
    if (mentorado.zapiInstanceId && mentorado.zapiManagedByIntegrator === "sim") {
      throw new Error("You already have an active WhatsApp instance");
    }

    // Verify integrator mode is available
    if (!zapiService.isIntegratorModeAvailable()) {
      throw new Error("Integrator mode is not configured. Contact support.");
    }

    // Create new instance via Integrator API
    const instanceName = `neondash-${mentorado.id}-${mentorado.nomeCompleto.split(" ")[0]}`;
    const result = await zapiService.createInstance(instanceName);

    // Encrypt token before storing
    const encryptedToken = encrypt(result.token);
    const dueDate = result.due ? new Date(result.due) : null;

    // Update mentorado with the new instance credentials
    const db = getDb();
    await db
      .update(mentorados)
      .set({
        zapiInstanceId: result.id,
        zapiToken: encryptedToken,
        zapiClientToken: null, // Clean up any old client token
        zapiConnected: "nao",
        zapiInstanceStatus: "trial",
        zapiInstanceDueDate: dueDate,
        zapiInstanceCreatedAt: new Date(),
        zapiManagedByIntegrator: "sim",
        updatedAt: new Date(),
      })
      .where(eq(mentorados.id, mentorado.id));

    return {
      success: true,
      instanceId: result.id,
      status: "trial",
      dueDate: dueDate?.toISOString() ?? null,
      message: "Instance created successfully! Now scan the QR code to connect.",
    };
  }),

  /**
   * Get instance lifecycle information
   */
  getInstanceLifecycle: protectedProcedure.query(async ({ ctx }) => {
    const mentorado = await getMentoradoWithZapi(ctx.user.id);
    if (!mentorado) {
      return { hasInstance: false };
    }

    if (!mentorado.zapiInstanceId) {
      return { hasInstance: false };
    }

    return {
      hasInstance: true,
      instanceId: mentorado.zapiInstanceId,
      status: mentorado.zapiInstanceStatus,
      dueDate: mentorado.zapiInstanceDueDate?.toISOString() ?? null,
      createdAt: mentorado.zapiInstanceCreatedAt?.toISOString() ?? null,
      managedByIntegrator: mentorado.zapiManagedByIntegrator === "sim",
      connected: mentorado.zapiConnected === "sim",
      phone: mentorado.zapiPhone,
    };
  }),

  /**
   * Activate instance (convert trial to paid)
   * Admin-only procedure
   */
  activateInstance: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Admin-only: verify user role before proceeding
      if (ctx.user.role !== "admin") {
        throw new Error("Only administrators can activate instances");
      }

      const db = getDb();
      const [mentorado] = await db
        .select()
        .from(mentorados)
        .where(eq(mentorados.id, input.mentoradoId))
        .limit(1);

      if (!mentorado) {
        throw new Error("Mentee not found");
      }

      if (!mentorado.zapiInstanceId || !mentorado.zapiToken) {
        throw new Error("Mentee does not have a Z-API instance configured");
      }

      const decryptedToken = safeDecrypt(mentorado.zapiToken);
      if (!decryptedToken) {
        throw new Error("Error decrypting token");
      }

      // Subscribe to the instance via Integrator API
      await zapiService.subscribeInstance(mentorado.zapiInstanceId, decryptedToken);

      // Update status in database
      await db
        .update(mentorados)
        .set({
          zapiInstanceStatus: "active",
          updatedAt: new Date(),
        })
        .where(eq(mentorados.id, mentorado.id));

      return { success: true, message: "Instance activated successfully" };
    }),

  /**
   * Cancel instance subscription
   * Admin-only procedure
   */
  cancelInstance: protectedProcedure
    .input(
      z.object({
        mentoradoId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Admin-only: verify user role before proceeding
      if (ctx.user.role !== "admin") {
        throw new Error("Only administrators can cancel instances");
      }

      const db = getDb();
      const [mentorado] = await db
        .select()
        .from(mentorados)
        .where(eq(mentorados.id, input.mentoradoId))
        .limit(1);

      if (!mentorado) {
        throw new Error("Mentee not found");
      }

      if (!mentorado.zapiInstanceId || !mentorado.zapiToken) {
        throw new Error("Mentee does not have a Z-API instance configured");
      }

      const decryptedToken = safeDecrypt(mentorado.zapiToken);
      if (!decryptedToken) {
        throw new Error("Error decrypting token");
      }

      // Cancel the instance via Integrator API
      await zapiService.cancelInstance(mentorado.zapiInstanceId, decryptedToken);

      // Update status in database
      await db
        .update(mentorados)
        .set({
          zapiInstanceStatus: "canceled",
          updatedAt: new Date(),
        })
        .where(eq(mentorados.id, mentorado.id));

      return {
        success: true,
        message: "Instance canceled. It remains active until the end of the billing period.",
      };
    }),
});
