import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { cookies } from 'next/headers';
import type { TokenPayload } from '@/lib/auth/jwt';
import type { userRoles } from '@/types';

export async function withAuth(
  req: NextRequest,
  allowedRoles?: userRoles[]
) {
  try {
    // Prefer the next/headers cookies() (works in edge/server handlers and is mocked in tests).
    const c = await cookies();
    // Support multiple cookie names for backwards compat and tests (token, authToken)
    let token =
      (c.get('token') as any) || (c.get('authToken') as any) || (req.cookies.get('token') as any) || (req.cookies.get('authToken') as any);

    // If token wasn't found via cookies(), try parsing Cookie header as a fallback (tests provide Cookie header)
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || req.headers.get('Cookie');
      if (cookieHeader) {
        const parsed = Object.fromEntries(
          cookieHeader.split(';').map((s) => s.trim().split('=').map(decodeURIComponent)) as [string, string][]
        );
        const headerToken = parsed['token'] || parsed['authToken'];
        if (headerToken) {
          token = { value: headerToken } as any;
        }
      }
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
      payload = verifyToken(token.value);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    // Check roles if specified
    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user info to request
    req.headers.set('x-user-id', payload.userId);
    req.headers.set('x-user-role', payload.role);

    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper to protect admin-only routes
export function withAdmin(req: NextRequest) {
  return withAuth(req, ['admin']);
}

// Helper to get user info from request after auth
export function getUserFromRequest(req: NextRequest) {
  return {
    userId: req.headers.get('x-user-id'),
    role: req.headers.get('x-user-role') as userRoles | null
  };
}