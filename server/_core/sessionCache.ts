/**
 * Session Cache Module
 *
 * Provides caching for Clerk session data to reduce API calls by ~80%.
 * Supports Redis with in-memory fallback.
 */

import { Redis } from "ioredis";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CachedSession {
  clerkId: string;
  email: string | null;
  name: string | null;
  role: "user" | "admin";
  imageUrl: string | null;
  cachedAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const SESSION_TTL_SECONDS = 3600; // 1 hour
const CACHE_KEY_PREFIX = "session:";

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

let redis: Redis | null = null;
const memoryCache = new Map<
  string,
  { data: CachedSession; expiresAt: number }
>();

// Stats tracking
let cacheHits = 0;
let cacheMisses = 0;

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Initialize Redis connection if REDIS_URL is set.
 * Falls back to in-memory cache silently.
 */
export async function initRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "session-cache",
        action: "init",
        message: "REDIS_URL not set, using in-memory cache",
      })
    );
    return;
  }

  try {
    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 100, 3000),
      lazyConnect: true,
    });

    await redis.connect();

    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "info",
        service: "session-cache",
        action: "init",
        message: "Redis connected successfully",
      })
    );
  } catch (error) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "warn",
        service: "session-cache",
        action: "init",
        message: "Redis connection failed, using in-memory cache",
        error: String(error),
      })
    );
    redis = null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// CACHE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get cached session by Clerk ID.
 * Checks Redis first, falls back to memory cache.
 */
export async function getCachedSession(
  clerkId: string
): Promise<CachedSession | null> {
  const cacheKey = `${CACHE_KEY_PREFIX}${clerkId}`;

  // Try Redis first
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        cacheHits++;
        return JSON.parse(cached) as CachedSession;
      }
    } catch (error) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          service: "session-cache",
          action: "get",
          clerkId,
          error: String(error),
        })
      );
    }
  }

  // Try memory cache
  const memoryCached = memoryCache.get(cacheKey);
  if (memoryCached && memoryCached.expiresAt > Date.now()) {
    cacheHits++;
    return memoryCached.data;
  }

  // Cache miss
  if (memoryCached) {
    memoryCache.delete(cacheKey); // Cleanup expired
  }

  cacheMisses++;
  return null;
}

/**
 * Set session in cache (dual-write to Redis and memory).
 */
export async function setCachedSession(
  clerkId: string,
  session: Omit<CachedSession, "cachedAt">
): Promise<void> {
  const cacheKey = `${CACHE_KEY_PREFIX}${clerkId}`;
  const cachedSession: CachedSession = {
    ...session,
    cachedAt: Date.now(),
  };

  // Write to Redis
  if (redis) {
    try {
      await redis.setex(
        cacheKey,
        SESSION_TTL_SECONDS,
        JSON.stringify(cachedSession)
      );
    } catch (error) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          service: "session-cache",
          action: "set",
          clerkId,
          error: String(error),
        })
      );
    }
  }

  // Write to memory cache
  memoryCache.set(cacheKey, {
    data: cachedSession,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
}

/**
 * Invalidate session cache (on user update/delete).
 */
export async function invalidateSession(clerkId: string): Promise<void> {
  const cacheKey = `${CACHE_KEY_PREFIX}${clerkId}`;

  // Delete from Redis
  if (redis) {
    try {
      await redis.del(cacheKey);
    } catch (error) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          service: "session-cache",
          action: "invalidate",
          clerkId,
          error: String(error),
        })
      );
    }
  }

  // Delete from memory cache
  memoryCache.delete(cacheKey);

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "info",
      service: "session-cache",
      action: "invalidated",
      clerkId,
    })
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get cache statistics for health check endpoint.
 */
export function getCacheStats(): CacheStats {
  const total = cacheHits + cacheMisses;
  return {
    hits: cacheHits,
    misses: cacheMisses,
    hitRate: total > 0 ? Math.round((cacheHits / total) * 100) : 0,
  };
}

/**
 * Reset cache stats (for testing).
 */
export function resetCacheStats(): void {
  cacheHits = 0;
  cacheMisses = 0;
}

// ═══════════════════════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Cleanup expired entries from memory cache periodically.
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, value] of Array.from(memoryCache)) {
    if (value.expiresAt <= now) {
      memoryCache.delete(key);
      cleaned++;
    }
  }

  return cleaned;
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
