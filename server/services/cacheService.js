import Redis from 'ioredis';

// In-Memory Fallback Store if Redis is temporarily unreachable
const inMemoryCache = new Map();

let redisClient = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) {
        // Suppress repeated spam reconnections; will retry periodically
        return Math.min(times * 1000, 15000);
      }
      return 1000;
    }
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('⚡ Redis Cache Engine: Connected and active.');
  });

  redisClient.on('ready', () => {
    isRedisAvailable = true;
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    // Log once without crashing the server
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Redis Cache warning (using in-memory fallback):', err.message);
    }
  });

  // Attempt eager connection in background
  redisClient.connect().catch(() => {
    isRedisAvailable = false;
  });
} catch (e) {
  isRedisAvailable = false;
}

/**
 * Get cached item by key
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function getCache(key) {
  if (isRedisAvailable && redisClient) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (err) {
      // Fallback to in-memory cache on read error
    }
  }

  // Fallback to in-memory cache
  const item = inMemoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    inMemoryCache.delete(key);
    return null;
  }
  return item.value;
}

/**
 * Set cached item with TTL in seconds
 * @param {string} key
 * @param {any} value
 * @param {number} ttlSeconds
 */
export async function setCache(key, value, ttlSeconds = 60) {
  if (isRedisAvailable && redisClient) {
    try {
      const stringified = JSON.stringify(value);
      await redisClient.set(key, stringified, 'EX', ttlSeconds);
      return true;
    } catch (err) {
      // Fallback to in-memory
    }
  }

  // Fallback to in-memory cache
  inMemoryCache.set(key, {
    value,
    expiresAt: Date.now() + (ttlSeconds * 1000)
  });
  return true;
}

/**
 * Delete a specific cache key
 * @param {string} key
 */
export async function delCache(key) {
  inMemoryCache.delete(key);
  if (isRedisAvailable && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {}
  }
}

/**
 * Invalidate all product-related caches
 */
export async function invalidateProductCache() {
  await delCache('cache:products:all');
  await delCache('cache:products:home');
  // Also clear any memory entries starting with cache:products
  for (const k of inMemoryCache.keys()) {
    if (k.startsWith('cache:products')) {
      inMemoryCache.delete(k);
    }
  }
  if (isRedisAvailable && redisClient) {
    try {
      const keys = await redisClient.keys('cache:products:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {}
  }
}

/**
 * Invalidate category caches
 */
export async function invalidateCategoryCache() {
  await delCache('cache:categories:all');
  for (const k of inMemoryCache.keys()) {
    if (k.startsWith('cache:categories')) {
      inMemoryCache.delete(k);
    }
  }
  if (isRedisAvailable && redisClient) {
    try {
      const keys = await redisClient.keys('cache:categories:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {}
  }
}

/**
 * Invalidate rental gallery cache
 */
export async function invalidateRentalCache() {
  await delCache('cache:rental:gallery');
  for (const k of inMemoryCache.keys()) {
    if (k.startsWith('cache:rental')) {
      inMemoryCache.delete(k);
    }
  }
}

/**
 * Global cache invalidator
 */
export async function invalidateAllCache() {
  inMemoryCache.clear();
  if (isRedisAvailable && redisClient) {
    try {
      const keys = await redisClient.keys('cache:*');
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {}
  }
}

export function isRedisActive() {
  return isRedisAvailable;
}
