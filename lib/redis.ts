import { createClient, RedisClientType } from 'redis';

let _client: RedisClientType | null = null;

function getRedisUrl(): string {
  // Strip surrounding quotes (e.g. from .env or deployment env vars)
  const url = process.env.REDIS_URL?.trim().replace(/^["']|["']$/g, '');
  if (!url || !url.startsWith('redis')) {
    throw new Error(
      'REDIS_URL must be set (e.g. redis://localhost:6379). ' +
      `Current value: ${url ? `"${url}"` : 'undefined'}`
    );
  }
  return url;
}

export async function connectRedis(): Promise<RedisClientType> {
  if (_client?.isOpen) return _client;
  const url = getRedisUrl();
  _client = createClient({ url });
  _client.on('error', (err) => console.error('Redis error:', err));
  await _client.connect();
  return _client;
}

// Proxy: lazy connect on first use, avoids "Invalid URL" at module load (e.g. during build)
function createLazyClient() {
  return new Proxy({} as RedisClientType, {
    get(_, prop: string) {
      return (...args: unknown[]) =>
        connectRedis().then((client) =>
          (client as unknown as Record<string, (...a: unknown[]) => unknown>)[prop]?.(...args)
        );
    },
  });
}

const lazyClient = createLazyClient();
export default lazyClient;
export const client = lazyClient;
