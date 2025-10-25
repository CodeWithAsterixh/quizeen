import type { NextRequestHandler, MiddlewareFactory } from '@/types/middleware';

/**
 * Composes multiple middleware functions into a single middleware chain
 * @param middlewares Array of middleware factories to compose
 * @returns A composed middleware function
 */
export const composeMiddleware = (...middlewares: MiddlewareFactory[]) => {
  return (handler: NextRequestHandler): NextRequestHandler => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
};