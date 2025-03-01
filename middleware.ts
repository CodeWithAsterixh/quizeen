import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if the auth cookie exists
  const token = request.cookies.get('token');

  // If token is not present, redirect to login page
  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Otherwise, continue
  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/account',
}