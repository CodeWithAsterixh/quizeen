import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

// Generate a random CSRF token using Web Crypto API
export function generateCsrfToken(): string {
  // Use Web Crypto API for Edge runtime compatibility
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Set the CSRF token in a cookie
export function appendCsrfToken(response: NextResponse): string {
  const token = generateCsrfToken();
  response.cookies.set(CSRF_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
  return token;
}

// Constant-time string comparison to prevent timing attacks
function safeCompare(a: string, b: string): boolean {
    console.log(`${a} === ${b}`)
  if (a.length !== b.length) {
    return false;
  }
  
  return a.split('').reduce((acc, char, i) => {
    return acc && char === b[i];
  }, true);
}

// Validate CSRF token from header against cookie
export async function validateCsrfToken(headerToken?: string): Promise<boolean> {
  if (!headerToken) return false;
  
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  if (!cookieToken) return false;
  try {
    return safeCompare(headerToken, cookieToken);
  } catch {
    return false;
  }
}

export { CSRF_HEADER };