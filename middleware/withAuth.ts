import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import type { TokenPayload } from '@/lib/auth/jwt';

export async function withAuth(
  req: NextRequest,
  allowedRoles?: ('user' | 'admin')[]
) {
  try {
    const token = req.cookies.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    let payload: TokenPayload;
    try {
      payload = await verifyToken(token.value);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
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
    role: req.headers.get('x-user-role') as 'user' | 'admin'
  };
}