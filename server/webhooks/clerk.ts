import type { Request, Response } from "express";
import { Webhook } from "svix";
import { createLogger } from "../_core/logger";
import { invalidateSession } from "../_core/sessionCache";
import { queueWebhookTask, setTaskProcessor } from "../_core/webhookQueue";
import { syncClerkUser } from "../services/userService";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ClerkUserPayload {
  id: string;
  email_addresses: {
    email_address: string;
    id: string;
    verification: { status: string };
  }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  public_metadata: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK TASK PROCESSOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Process webhook tasks from the queue.
 */
async function processClerkWebhookTask(task: { type: string; data: unknown }): Promise<void> {
  const logger = createLogger({ service: "clerk-webhook" });

  if (task.type === "user.created" || task.type === "user.updated") {
    const userData = task.data as ClerkUserPayload;
    await syncClerkUser(userData);
    await invalidateSession(userData.id);
    logger.info("user_synced", { userId: userData.id, eventType: task.type });
  } else if (task.type === "user.deleted") {
    const userData = task.data as { id: string };
    await invalidateSession(userData.id);
    logger.info("user_deleted", { userId: userData.id });
  }
}

// Register the task processor
setTaskProcessor(processClerkWebhookTask);

// ═══════════════════════════════════════════════════════════════════════════
// WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export async function handleClerkWebhook(req: Request, res: Response) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  const logger = createLogger({ service: "clerk-webhook" });

  if (!SIGNING_SECRET) {
    logger.error("config_error", new Error("CLERK_WEBHOOK_SECRET is missing"));
    return res.status(500).json({ error: "Configuration error" });
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const svix_id = req.headers["svix-id"] as string;
  const svix_timestamp = req.headers["svix-timestamp"] as string;
  const svix_signature = req.headers["svix-signature"] as string;

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    logger.warn("missing_headers");
    return res.status(400).json({
      error: "Error: Missing valid Svix headers",
    });
  }

  let evt: { type: string; data: unknown };

  try {
    // Attempt to use rawBody if available (best practice), otherwise fallback to stringified body
    const payload = (req as Request & { rawBody?: Buffer }).rawBody || JSON.stringify(req.body);

    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as { type: string; data: unknown };
  } catch (err) {
    logger.error("verification_failed", err);
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Invalid signature",
    });
  }

  // Queue the webhook for async processing
  logger.info("webhook_received", { type: evt.type });

  try {
    await queueWebhookTask({
      type: evt.type,
      data: evt.data,
      timestamp: new Date(),
    });

    // Return 202 Accepted immediately (async processing)
    return res.status(202).json({ success: true, message: "Queued for processing" });
  } catch (error) {
    // Fallback to sync processing if queue fails
    logger.warn("queue_failed_fallback_sync", error);

    try {
      await processClerkWebhookTask({ type: evt.type, data: evt.data });
      return res.status(200).json({ success: true });
    } catch (e) {
      logger.error("sync_processing_failed", e);
      return res.status(500).json({ success: false, message: "Processing failed" });
    }
  }
}
