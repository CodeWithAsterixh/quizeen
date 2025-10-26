import { AppError } from '@/lib/errors';
import { NextRequest, NextResponse } from 'next/server';
import type { MiddlewareFactory } from '@/types/middleware';

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Maximum number of requests allowed in the window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
// Note: In production, use Redis or similar for distributed systems
const ipRequestMap = new Map<string, RateLimitStore>();

// Clean up expired entries periodically
const cleanup = () => {
  const now = Date.now();
  for (const [ip, data] of ipRequestMap.entries()) {
    if (data.resetTime <= now) {
      ipRequestMap.delete(ip);
    }
  }
};

// Run cleanup every minute
if (typeof setInterval !== 'undefined') {
  setInterval(cleanup, 60000);
}


export function createRateLimiter(config: RateLimitConfig): MiddlewareFactory {
  return (handler) => {
    return async (req) => {
      // Get client identifier (IP or custom key)
      const key = config.keyGenerator?.(req) ?? 
        req.headers.get('x-forwarded-for')?.split(',')[0] ?? 
        req.headers.get('x-real-ip') ?? 
        'anonymous';
      
      const now = Date.now();
      
      let requestData = ipRequestMap.get(key);
      
      // Reset if window has passed
      if (!requestData || requestData.resetTime <= now) {
        requestData = {
          count: 0,
          resetTime: now + config.windowMs
        };
        ipRequestMap.set(key, requestData);
      }
      
      // Increment request count
      const currentData = requestData;
      currentData.count++;
      ipRequestMap.set(key, currentData);
      
      // Check if limit exceeded
      if (currentData.count > config.maxRequests) {
        const retryAfter = Math.ceil((currentData.resetTime - now) / 1000);
        const response = NextResponse.json(
          { 
            error: 'Too many requests',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter 
          },
          { status: 429 }
        );
        response.headers.set('Retry-After', retryAfter.toString());
        throw new AppError('Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
      }
      
      // Set rate limit headers
      const response = await handler(req);
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', 
        Math.max(0, config.maxRequests - currentData.count).toString()
      );
      response.headers.set('X-RateLimit-Reset', 
        Math.ceil(currentData.resetTime / 1000).toString()
      );
      
      return response;
    };
  };
}

// Default rate limiters for different endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 requests per 15 minutes for auth endpoints
});

export const standardRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute for standard endpoints
});