interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const rateLimiter = new Map<string, RateLimitInfo>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, info] of rateLimiter.entries()) {
    if (now > info.resetTime) {
      rateLimiter.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export const ratelimit = {
  limit: async (ip: string) => {
    const now = Date.now();
    const info = rateLimiter.get(ip);

    if (!info || now > info.resetTime) {
      rateLimiter.set(ip, { count: 1, resetTime: now + WINDOW_MS });
      return { success: true };
    }

    if (info.count >= MAX_REQUESTS) {
      return { success: false };
    }

    info.count++;
    return { success: true };
  }
};
