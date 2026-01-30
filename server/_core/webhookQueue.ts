/**
 * Webhook Queue Module
 *
 * Processes Clerk webhooks asynchronously with rate limiting and retry logic.
 */

import PQueue from "p-queue";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface WebhookTask {
  type: string;
  data: unknown;
  timestamp: Date;
  retries?: number;
}

interface FailedTask {
  task: WebhookTask;
  error: string;
  failedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const QUEUE_CONCURRENCY = 5;
const QUEUE_INTERVAL = 1000; // 1 second
const QUEUE_INTERVAL_CAP = 10; // Max 10 per interval
const MAX_RETRIES = 3;

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

const queue = new PQueue({
  concurrency: QUEUE_CONCURRENCY,
  interval: QUEUE_INTERVAL,
  intervalCap: QUEUE_INTERVAL_CAP,
});

const failedTasks: FailedTask[] = [];

// ═══════════════════════════════════════════════════════════════════════════
// TASK PROCESSOR
// ═══════════════════════════════════════════════════════════════════════════

type TaskProcessor = (task: WebhookTask) => Promise<void>;
let taskProcessor: TaskProcessor | null = null;

/**
 * Register the task processor function.
 */
export function setTaskProcessor(processor: TaskProcessor): void {
  taskProcessor = processor;
}

/**
 * Process a single webhook task.
 */
async function processWebhookTask(task: WebhookTask): Promise<void> {
  if (!taskProcessor) {
    throw new Error("Task processor not registered");
  }

  try {
    await taskProcessor(task);

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "webhook-queue",
        action: "task_processed",
        type: task.type,
        retries: task.retries || 0,
      })
    );
  } catch (error) {
    const retries = (task.retries || 0) + 1;

    if (retries < MAX_RETRIES) {
      // Re-queue with incremented retry count
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          service: "webhook-queue",
          action: "task_retry",
          type: task.type,
          retries,
          error: String(error),
        })
      );

      await queueWebhookTask({ ...task, retries });
    } else {
      // Max retries exceeded, add to failed tasks
      failedTasks.push({
        task,
        error: String(error),
        failedAt: new Date(),
      });

      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "error",
          service: "webhook-queue",
          action: "task_failed",
          type: task.type,
          retries,
          error: String(error),
        })
      );
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a webhook task to the queue.
 */
export async function queueWebhookTask(task: WebhookTask): Promise<void> {
  await queue.add(() => processWebhookTask(task));
}

/**
 * Retry all failed tasks.
 */
export async function retryFailedTasks(): Promise<number> {
  const tasksToRetry = [...failedTasks];
  failedTasks.length = 0; // Clear failed tasks

  let retried = 0;
  for (const { task } of tasksToRetry) {
    await queueWebhookTask({ ...task, retries: 0 });
    retried++;
  }

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "webhook-queue",
      action: "retry_failed_tasks",
      count: retried,
    })
  );

  return retried;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get queue statistics.
 */
export function getQueueStats(): {
  pending: number;
  size: number;
  failedCount: number;
} {
  return {
    pending: queue.pending,
    size: queue.size,
    failedCount: failedTasks.length,
  };
}

/**
 * Get failed tasks for debugging.
 */
export function getFailedTasks(): FailedTask[] {
  return [...failedTasks];
}
