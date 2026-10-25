/** Simple in-memory rate limiter for development.
 *  For production, replace the store with Redis or equivalent.
 *  The interface is isolated so swapping is straightforward. */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60_000);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume a rate-limit token.
 * @param key - Unique identifier (e.g., IP + action)
 * @param limit - Maximum requests per window
 * @param windowMs - Window duration in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/** Convenience for API routes */
export function rateLimitByIp(
  ip: string | null,
  action: string,
  limit: number = 5,
  windowMs: number = 60_000,
): RateLimitResult {
  const key = `${action}:${ip ?? "unknown"}`;
  return checkRateLimit(key, limit, windowMs);
}
