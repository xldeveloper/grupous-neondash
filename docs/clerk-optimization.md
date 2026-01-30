# 🚀 Implementação: Otimizações Clerk + Neon

## Código pronto para production

---

## 1. Session Caching com Redis (Opcional)

### Instalação

```bash
bun add redis
```

### Implementação Recomendada

```typescript
// server/_core/sessionCache.ts
import { createClient, type RedisClientType } from "redis";

interface CachedSession {
  clerkId: string;
  email: string | null;
  name: string | null;
  role: "admin" | "user";
  imageUrl: string | null;
}

let redisClient: RedisClientType | null = null;

export async function initRedis() {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      redisClient.on("error", err => console.error("Redis error:", err));
      await redisClient.connect();
      console.log("[Redis] Connected");
    } catch (error) {
      console.warn("[Redis] Connection failed, using in-memory cache:", error);
    }
  }
}

const IN_MEMORY_CACHE = new Map<
  string,
  { data: CachedSession; timestamp: number }
>();
const CACHE_TTL = 60 * 60; // 1 hour in seconds

export async function getCachedSession(
  clerkId: string
): Promise<CachedSession | null> {
  const cacheKey = `session:${clerkId}`;

  // Try Redis first
  if (redisClient) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn("[Cache] Redis get failed:", error);
    }
  }

  // Fallback to in-memory
  const inMemory = IN_MEMORY_CACHE.get(clerkId);
  if (inMemory && Date.now() - inMemory.timestamp < CACHE_TTL * 1000) {
    return inMemory.data;
  }

  IN_MEMORY_CACHE.delete(clerkId);
  return null;
}

export async function setCachedSession(
  clerkId: string,
  session: CachedSession
): Promise<void> {
  const cacheKey = `session:${clerkId}`;

  // Store in Redis
  if (redisClient) {
    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(session));
    } catch (error) {
      console.warn("[Cache] Redis set failed:", error);
    }
  }

  // Fallback to in-memory
  IN_MEMORY_CACHE.set(clerkId, { data: session, timestamp: Date.now() });
}

export async function invalidateSession(clerkId: string): Promise<void> {
  const cacheKey = `session:${clerkId}`;

  if (redisClient) {
    try {
      await redisClient.del(cacheKey);
    } catch (error) {
      console.warn("[Cache] Redis delete failed:", error);
    }
  }

  IN_MEMORY_CACHE.delete(clerkId);
}
```

### Uso no Context

```typescript
// server/_core/context.ts - Updated
import { getCachedSession, setCachedSession } from "./sessionCache";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const auth = getAuth(opts.req);

  if (!auth.userId) {
    return { req: opts.req, res: opts.res, user: null, mentorado: null };
  }

  // 1. Check cache (reduz Clerk calls em ~80%)
  const cached = await getCachedSession(auth.userId);
  if (cached) {
    const db = getDb();
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.clerkId, cached.clerkId))
      .limit(1);

    if (user[0]) {
      // User found in DB, fetch mentorado
      const mentorado = await db
        .select()
        .from(schema.mentorados)
        .where(eq(schema.mentorados.userId, user[0].id))
        .limit(1);

      return {
        req: opts.req,
        res: opts.res,
        user: user[0],
        mentorado: mentorado[0] ?? null,
      };
    }
  }

  // 2. Cache miss - fetch full from Clerk
  let clerkUser: Awaited<ReturnType<typeof clerkClient.users.getUser>> | null =
    null;
  try {
    clerkUser = await clerkClient.users.getUser(auth.userId);
  } catch (error) {
    console.warn("[Context] Failed to fetch Clerk user:", error);
  }

  const db = getDb();
  const user = await upsertUserFromClerk(auth.userId, clerkUser ?? undefined);

  // Cache the session
  if (user) {
    await setCachedSession(auth.userId, {
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "user",
      imageUrl: user.imageUrl,
    });
  }

  let mentorado: Mentorado | null = null;
  if (user) {
    const existingMentorado = await db
      .select()
      .from(schema.mentorados)
      .where(eq(schema.mentorados.userId, user.id))
      .limit(1);

    mentorado = existingMentorado[0] ?? null;

    if (!mentorado && user.email) {
      const mentoradoByEmail = await db
        .select()
        .from(schema.mentorados)
        .where(eq(schema.mentorados.email, user.email))
        .limit(1);

      if (mentoradoByEmail[0]) {
        await db
          .update(schema.mentorados)
          .set({ userId: user.id })
          .where(eq(schema.mentorados.id, mentoradoByEmail[0].id));

        mentorado = { ...mentoradoByEmail[0], userId: user.id };
      }
    }
  }

  return {
    req: opts.req,
    res: opts.res,
    user: user ?? null,
    mentorado,
  };
}
```

---

## 2. Database Query Optimization

```typescript
// Exemplo de uso de leftJoin para reduzir queries
const [combined] = await db
  .select({
    user: users,
    mentorado: mentorados,
    atividades: atividades,
  })
  .from(users)
  .leftJoin(mentorados, eq(users.id, mentorados.userId))
  .leftJoin(atividades, eq(mentorados.id, atividades.mentoradoId))
  .where(eq(users.clerkId, clerkId))
  .limit(1);
```

---

## 3. Webhook Batching com p-queue

```bash
bun add p-queue
```

```typescript
// server/_core/webhookQueue.ts
import PQueue from "p-queue";

interface WebhookTask {
  type: "user.created" | "user.updated" | "user.deleted";
  data: Record<string, any>;
  timestamp: Date;
}

const webhookQueue = new PQueue({
  concurrency: 5,
  interval: 1000,
  intervalCap: 10,
});
const failedTasks: WebhookTask[] = [];

export async function queueWebhookTask(task: WebhookTask): Promise<void> {
  return webhookQueue.add(async () => {
    try {
      await processWebhookTask(task);
    } catch (error) {
      console.error("[Webhook] Processing failed:", error);
      failedTasks.push(task);

      if (failedTasks.length > 10) {
        retryFailedTasks();
      }
    }
  });
}

async function processWebhookTask(task: WebhookTask): Promise<void> {
  switch (task.type) {
    case "user.created":
    case "user.updated":
      await upsertUserFromClerk(task.data.id, task.data);
      break;
    case "user.deleted":
      await deleteUserFromClerk(task.data.id);
      break;
  }
}

async function retryFailedTasks(): Promise<void> {
  const tasks = [...failedTasks];
  failedTasks.length = 0;

  for (const task of tasks) {
    await queueWebhookTask(task);
  }
}
```

```typescript
// Uso na rota de webhook
app.post(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    (req as any).rawBody = req.body;

    try {
      const event = JSON.parse((req as any).rawBody.toString());

      await queueWebhookTask({
        type: event.type,
        data: event.data,
        timestamp: new Date(),
      });

      res.sendStatus(202);
    } catch (error) {
      console.error("[Webhook] Queue failed:", error);
      res.sendStatus(500);
    }
  }
);
```

---

## 4. Rate Limiting Integrado

```bash
bun add express-rate-limit
```

```typescript
import rateLimit from "express-rate-limit";
import { getAuth } from "@clerk/express";

export const userRateLimiter = rateLimit({
  keyGenerator: req => {
    const auth = getAuth(req as any);
    return auth.userId || req.ip || "unknown";
  },
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this account, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  skip: req => {
    const auth = getAuth(req as any);
    return auth.sessionClaims?.metadata?.role === "admin";
  },
});

export const authRateLimiter = rateLimit({
  keyGenerator: req => req.ip || "unknown",
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});
```

```typescript
// Uso
app.use("/api/trpc", userRateLimiter);
app.post("/api/auth/login", authRateLimiter, (req, res) => {
  // handler de login
});
```

---

## 5. Logger Estruturado

```typescript
// server/_core/logger.ts
interface LogContext {
  userId?: string;
  requestId: string;
  timestamp: Date;
  service: string;
}

export function createLogger(context: Partial<LogContext>) {
  const requestId = Math.random().toString(36).substring(7);
  const baseContext: LogContext = {
    requestId,
    timestamp: new Date(),
    service: "neondash",
    ...context,
  };

  return {
    info: (action: string, data?: Record<string, any>) => {
      console.log(
        JSON.stringify({ ...baseContext, level: "info", action, ...data })
      );
    },
    warn: (action: string, error: unknown, data?: Record<string, any>) => {
      console.warn(
        JSON.stringify({
          ...baseContext,
          level: "warn",
          action,
          error: String(error),
          ...data,
        })
      );
    },
    error: (action: string, error: unknown, data?: Record<string, any>) => {
      console.error(
        JSON.stringify({
          ...baseContext,
          level: "error",
          action,
          error: String(error),
          stack: error instanceof Error ? error.stack : undefined,
          ...data,
        })
      );
    },
  };
}
```

---

## 6. Checklist Rápido

- [ ] Adicionar Redis e configurar `REDIS_URL`
- [ ] Implementar `sessionCache.ts`
- [ ] Atualizar `createContext` para usar cache
- [ ] Implementar `webhookQueue.ts`
- [ ] Adicionar `userRateLimiter` e `authRateLimiter`
- [ ] Adicionar `logger.ts` e usar no contexto/rotas
