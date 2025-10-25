import { generateCsrfToken } from '@/lib/security/csrf';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check for existing token
  const existingToken = request.cookies.get('csrf_token')?.value;
  const token = existingToken || generateCsrfToken();
  
  const response = NextResponse.json({ ok: true });
  
  // Only set cookie if it doesn't exist
  if (!existingToken) {
    response.cookies.set('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }
  
  // Always send token in header for client access
  response.headers.set('x-csrf-token', token);
  
  return response;
}