import { AppError } from '@/lib/errors';
import { NextResponse } from 'next/server';

import type { MiddlewareFactory } from '@/types/middleware';

export const withErrorHandler: MiddlewareFactory = (handler) => {
  return async (req) => {
    try {
      const response = await handler(req);
      return response;
    } catch (error) {
      console.error('Request error:', error);

      if (error instanceof AppError) {
        return NextResponse.json(error.toJSON(), {
          status: error.statusCode,
        });
      }

      // Don't expose internal errors to the client
      return NextResponse.json(
        { error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' } },
        { status: 500 }
      );
    }
  };
}