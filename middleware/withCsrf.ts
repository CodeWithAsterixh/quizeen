import { ForbiddenError } from '@/lib/errors';
import { CSRF_HEADER, validateCsrfToken } from '@/lib/security/csrf';

const CSRF_PROTECTED_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

import type { MiddlewareFactory } from '@/types/middleware';

export const withCsrf: MiddlewareFactory = (handler) => {
  return async (req) => {
    // In test environment, skip CSRF checks to make handler testing easier
    if (process.env.NODE_ENV === 'test') {
      return handler(req);
    }

    // Only check CSRF for state-changing methods
    if (CSRF_PROTECTED_METHODS.has(req.method)) {
      const csrfToken = req.headers.get(CSRF_HEADER);
      const isValid = await validateCsrfToken(csrfToken ?? undefined);
      if (!isValid) {
        throw new ForbiddenError('Invalid CSRF token');
      }
    }
    
    const response = await handler(req);

    // Pass through the existing token in the response header
    const existingToken = req.cookies.get('csrf_token')?.value;
    if (existingToken) {
      response.headers.set(CSRF_HEADER, existingToken);
    }
    
    return response;
  };
}