import 'server-only';

/**
 * Minimal in-memory rate limiter. Beta-grade — fine for retardskills.com
 * traffic. If volume grows, swap for a shared store (Redis / Convex).
 */

type RouteConfig = { limit: number; windowMs: number };

const ROUTE_LIMITS: Record<string, RouteConfig> = {
  '/api/signup': { limit: 5, windowMs: 60_000 },
  '/api/review/submit': { limit: 3, windowMs: 60_000 },
  '/api/access': { limit: 30, windowMs: 60_000 },
};

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? 'unknown';
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
};

export async function checkRequestRateLimit(
  request: Request,
  routeKey: string,
): Promise<RateLimitResult | null> {
  const config = ROUTE_LIMITS[routeKey];
  if (!config) return null;

  const ip = getClientIp(request);
  const key = `${routeKey}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    const fresh: Bucket = { count: 1, resetAt: now + config.windowMs };
    buckets.set(key, fresh);
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt: fresh.resetAt,
    };
  }

  bucket.count += 1;
  const allowed = bucket.count <= config.limit;
  return {
    allowed,
    limit: config.limit,
    remaining: Math.max(0, config.limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

export function createRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  };
}
