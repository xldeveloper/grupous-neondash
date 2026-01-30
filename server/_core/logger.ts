/**
 * Structured Logger Module
 *
 * Provides JSON-formatted logging with request context for traceability.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LogContext {
  userId?: string | null;
  requestId: string;
  service?: string;
}

export interface Logger {
  info: (action: string, data?: Record<string, unknown>) => void;
  warn: (action: string, error?: unknown, data?: Record<string, unknown>) => void;
  error: (action: string, error: unknown, data?: Record<string, unknown>) => void;
  debug: (action: string, data?: Record<string, unknown>) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate unique request ID.
 */
export function generateRequestId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Format error for logging.
 */
function formatError(error: unknown): { message: string; stack?: string } {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }
  return { message: String(error) };
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGER FACTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a logger with context (userId, requestId).
 */
export function createLogger(context: Partial<LogContext> = {}): Logger {
  const requestId = context.requestId || generateRequestId();
  const service = context.service || "server";

  const baseContext = {
    requestId,
    userId: context.userId ?? undefined,
    service,
  };

  return {
    info: (action: string, data?: Record<string, unknown>) => {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "info",
          ...baseContext,
          action,
          ...data,
        })
      );
    },

    warn: (action: string, error?: unknown, data?: Record<string, unknown>) => {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          ...baseContext,
          action,
          ...(error ? { error: formatError(error) } : {}),
          ...data,
        })
      );
    },

    error: (action: string, error: unknown, data?: Record<string, unknown>) => {
      console.error(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          ...baseContext,
          action,
          error: formatError(error),
          ...data,
        })
      );
    },

    debug: (action: string, data?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          JSON.stringify({
            timestamp: new Date().toISOString(),
            level: "debug",
            ...baseContext,
            action,
            ...data,
          })
        );
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Measure execution time of an async operation.
 */
export async function measureAsync<T>(
  logger: Logger,
  action: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = Math.round(performance.now() - start);
    logger.info(`${action}_completed`, { durationMs: duration });
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - start);
    logger.error(`${action}_failed`, error, { durationMs: duration });
    throw error;
  }
}
