import Redis from "ioredis";

interface Log {
  text: string;
  explanation: string;
  ai_analysis: {
    sexism_score: number;
    counter_comments: string[];
    tags: string[];
  };
  tags: string[];
  votes: { sexist: number; notSexist: number };
  createdAt: string;
}

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Cache trending logs for 5 minutes
export async function cacheTrendingLogs(logs: Log[]): Promise<void> {
  const key = "trending_logs";
  await redis.set(key, JSON.stringify(logs), "EX", 60 * 5);
}

// Retrieve cached trending logs
export async function getCachedTrendingLogs(): Promise<Log[] | null> {
  const key = "trending_logs";
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) as Log[] : null;
}

// Simple rate limiting per IP (10 requests/min)
export async function rateLimit(ip: string): Promise<void> {
  const key = `rate_limit:${ip}`;
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, 60);
  }
  if (current > 10) {
    throw new Error("Rate limit exceeded");
  }
}
