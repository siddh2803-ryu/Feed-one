/**
 * Feed One: Idempotent Request Caching
 */
const idempotencyCache = new Map<string, { response: any; cachedAt: number }>();

export function checkIdempotency(key: string, ttlMs: number = 300000): any | null {
  const cached = idempotencyCache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.cachedAt > ttlMs) {
    idempotencyCache.delete(key);
    return null;
  }
  return cached.response;
}

export function saveIdempotency(key: string, response: any): void {
  idempotencyCache.set(key, { response, cachedAt: Date.now() });
}
