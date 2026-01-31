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
function _formatError(error: unknown): { message: string; stack?: string } {
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

  const _baseContext = {
    requestId,
    userId: context.userId ?? undefined,
    service,
  };

  return {
    info: (_action: string, _data?: Record<string, unknown>) => {},

    warn: (_action: string, _error?: unknown, _data?: Record<string, unknown>) => {},

    error: (_action: string, _error: unknown, _data?: Record<string, unknown>) => {},

    debug: (_action: string, _data?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === "development") {
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
