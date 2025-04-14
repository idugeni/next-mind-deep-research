import redis from "./redis"

type RateLimitType = "search" | "generate"

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export async function rateLimit(
  identifier: string,
  type: RateLimitType,
  maxRequests: number,
): Promise<RateLimitResult> {
  const windowMs = type === "search" ? 60 * 1000 : 5 * 60 * 1000 // 1 minute for search, 5 minutes for generate
  const now = Date.now()
  const window = Math.floor(now / windowMs)
  const key = `ratelimit:${identifier}:${type}:${window}`

  // Increment the counter for the current window
  const count = await redis.incr(key)

  // Set expiration for the key if it's new
  if (count === 1) {
    await redis.expire(key, Math.ceil(windowMs / 1000))
  }

  // Calculate reset time
  const reset = (window + 1) * windowMs

  return {
    success: count <= maxRequests,
    limit: maxRequests,
    remaining: Math.max(0, maxRequests - count),
    reset,
  }
}
