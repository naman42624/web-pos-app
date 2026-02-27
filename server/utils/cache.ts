// In-memory cache for frequently accessed data
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

const cache = new Map<string, CacheEntry<any>>();

export function setCache<T>(key: string, data: T, ttlSeconds: number = 300) {
  const ttlMs = ttlSeconds * 1000;
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
  console.log(`[Cache] Set cache key: ${key} (TTL: ${ttlSeconds}s)`);
}

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }

  // Check if cache has expired
  const age = Date.now() - entry.timestamp;
  if (age > entry.ttl) {
    cache.delete(key);
    console.log(`[Cache] Expired cache key: ${key}`);
    return null;
  }

  console.log(`[Cache] Hit cache key: ${key} (age: ${age}ms)`);
  return entry.data as T;
}

export function clearCache(pattern?: string) {
  if (!pattern) {
    console.log(`[Cache] Cleared all cache (${cache.size} entries)`);
    cache.clear();
    return;
  }

  let cleared = 0;
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
      cleared++;
    }
  }
  console.log(`[Cache] Cleared ${cleared} cache entries matching pattern: ${pattern}`);
}

export function getCacheStats() {
  return {
    size: cache.size,
    entries: Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      ttl: entry.ttl,
      expired: Date.now() - entry.timestamp > entry.ttl,
    })),
  };
}

// Auto cleanup expired entries every minute
setInterval(() => {
  let cleaned = 0;
  for (const [key, entry] of cache.entries()) {
    if (Date.now() - entry.timestamp > entry.ttl) {
      cache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`[Cache] Auto-cleanup removed ${cleaned} expired entries`);
  }
}, 60000);
