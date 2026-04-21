/**
 * Rate limiting utilities to prevent brute force attacks
 * Uses in-memory storage (consider Redis for production)
 */

// Simple in-memory store (for production, use Redis or similar)
const rateLimitStore = new Map();

/**
 * Rate limiter configuration
 */
const RATE_LIMIT_CONFIG = {
  // Auth endpoints (login, register, etc.)
  auth: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10,
    message: 'Too many authentication attempts. Please try again later.'
  },
  // API endpoints (image generation, etc.)
  api: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many requests. Please slow down.'
  },
  // Public endpoints (general access)
  public: {
    windowMs: 1 * 60 * 1000, // 1 minute
    maxRequests: 60,
    message: 'Too many requests. Please try again later.'
  }
};

/**
 * Clean up old rate limit entries
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier (IP address)
 */
function getClientIdentifier(req) {
  // Try multiple headers for IP detection
  const forwarded = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  const cfIp = req.headers['cf-connecting-ip'];

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  if (cfIp) {
    return cfIp;
  }

  // Fallback to connection remote address
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Check if rate limit is exceeded
 */
function checkRateLimit(identifier, config) {
  const now = Date.now();
  const key = identifier;

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);

  if (!entry) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }

  // Reset if window expired
  if (now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs
    };
  }

  // Increment counter
  entry.count++;

  // Store updated entry
  rateLimitStore.set(key, entry);

  // Check if limit exceeded
  const isLimited = entry.count > config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetTime = new Date(entry.resetTime);

  return {
    isLimited,
    remaining,
    resetTime,
    count: entry.count,
    limit: config.maxRequests,
    windowMs: config.windowMs
  };
}

/**
 * Rate limiting middleware factory
 */
export function createRateLimiter(type = 'public') {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.public;

  return function rateLimit(req, res, next) {
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      cleanupRateLimitStore();
    }

    const identifier = getClientIdentifier(req);
    const result = checkRateLimit(identifier, config);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', result.limit);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetTime.getTime());

    if (result.isLimited) {
      const retryAfter = Math.ceil((result.resetTime.getTime() - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        error: config.message,
        retryAfter,
        resetTime: result.resetTime
      });
    }

    // Add rate limit info to request for debugging
    req.rateLimit = result;

    return next(req, res);
  };
}

/**
 * Pre-configured rate limiters
 */
export const authRateLimit = createRateLimiter('auth');
export const apiRateLimit = createRateLimiter('api');
export const publicRateLimit = createRateLimiter('public');

/**
 * Manually check rate limit without middleware
 */
export function checkRateLimitManually(identifier, type = 'public') {
  const config = RATE_LIMIT_CONFIG[type] || RATE_LIMIT_CONFIG.public;
  return checkRateLimit(identifier, config);
}

/**
 * Reset rate limit for a specific identifier (admin function)
 */
export function resetRateLimit(identifier) {
  rateLimitStore.delete(identifier);
}

/**
 * Get current rate limit status for an identifier
 */
export function getRateLimitStatus(identifier) {
  return rateLimitStore.get(identifier) || null;
}

/**
 * Get statistics about rate limiting
 */
export function getRateLimitStats() {
  const stats = {
    totalEntries: rateLimitStore.size,
    entriesByType: {},
    entriesNearLimit: 0
  };

  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    // Count entries near limit (>80%)
    if (entry.count / entry.limit > 0.8) {
      stats.entriesNearLimit++;
    }

    // Clean up expired entries
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
      stats.totalEntries--;
    }
  }

  return stats;
}
