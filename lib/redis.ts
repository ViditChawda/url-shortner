import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error("REDIS_URL is not defined");
}

export const client = createClient({
  url: redisUrl,
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

await client.connect();