import redis, { connectRedis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const CACHE_PREFIX = "url:";
const CACHE_TTL_SECONDS = 3600; // 1 hour

/**
 * Redirect service: resolves short code to long URL.
 * 1. Check Redis (cache) — if found, return immediately
 * 2. If not in Redis — query database
 * 3. Store in Redis (cache with TTL)
 * 4. Return long URL for redirect
 */
export async function resolveShortCode(shortCode: string): Promise<string | null> {
  const code = shortCode?.trim();
  if (!code) return null;

  const cacheKey = `${CACHE_PREFIX}${code}`;

  await connectRedis();

  // 1. Check Redis cache
  const cachedUrl = await redis.get(cacheKey);
  if (cachedUrl) {
    return cachedUrl;
  }

  // 2. Query database
  const urlRecord = await prisma.url.findUnique({
    where: { shortCode: code },
  });

  if (!urlRecord) {
    return null;
  }

  const longUrl = urlRecord.longUrl;

  // 3. Cache in Redis with TTL
  await redis.set(cacheKey, longUrl, { EX: CACHE_TTL_SECONDS });

  // Increment use count (fire and forget)
  prisma.url
    .update({
      where: { id: urlRecord.id },
      data: { usedCount: { increment: 1 } },
    })
    .catch((err) => console.error("[redirect] usedCount increment failed:", err));

  return longUrl;
}
