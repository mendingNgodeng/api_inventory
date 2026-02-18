// dont forget to instal redis to use this!

import type { Context, Next } from 'hono';
// import { redis } from '../utils/redis';

interface RateLimitOptions {
  windowSec: number;
  max: number;
  keyPrefix?: string;
}

export const rateLimit = (opts: RateLimitOptions) => {
  const { windowSec, max, keyPrefix = 'rl' } = opts;

  return async (c: Context, n: Next) => {
    const user = c.get('user');

    const ip =
      c.req.header('x-forwarded') || c.req.header('x-real-ip') || 'unknown';

    const identifier = user?.id ?? ip;

    const key = `${keyPrefix}:${identifier}`;

    const current = await redis.incr(key);

    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    if (current > max) {
      const ttl = await redis.ttl(key);

      return c.json(
        {
          error: 'Rate limit maxed OUT!',
          retryAfter: ttl,
        },
        429
      );
    }
    await n();
  };
};