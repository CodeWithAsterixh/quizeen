import { NextResponse } from 'next/server';
import type { NextRequestHandler } from '@/types/middleware';
import { getUserFromRequest, withAuth } from '@/middleware/withAuth';

export const withRole = (allowedRoles: string[] | string, handler: NextRequestHandler): NextRequestHandler => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req) => {
    // Ensure user is authenticated first
    const authResponse = await withAuth(req);
    if (authResponse instanceof NextResponse && authResponse.status !== 200) return authResponse;

    // Check role header set by withAuth
    const role = req.headers.get('x-user-role') || '';
    if (!roles.includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req);
  };
};

export default withRole;
