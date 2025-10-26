import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const ACCESS_TOKEN_NAME = 'token';
const REFRESH_TOKEN_NAME = 'refreshToken';

export function setAccessTokenCookie(response: NextResponse, token: string) {
  // Attach cookie to the NextResponse so Set-Cookie is sent to the client
  response.cookies.set({
    name: ACCESS_TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 8 * 60 * 60, // 8 hours
  });
}

export function setRefreshTokenCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: REFRESH_TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export async function clearAuthCookies(response?: NextResponse) {
  // If a NextResponse is provided, clear on it; otherwise, mutate the current cookies()
  if (response) {
    response.cookies.set({ name: ACCESS_TOKEN_NAME, value: '', path: '/', maxAge: 0 });
    response.cookies.set({ name: REFRESH_TOKEN_NAME, value: '', path: '/', maxAge: 0 });
    return;
  }

  const c = await cookies();
  c.set({ name: ACCESS_TOKEN_NAME, value: '', path: '/', maxAge: 0 });
  c.set({ name: REFRESH_TOKEN_NAME, value: '', path: '/', maxAge: 0 });
}

export async function getRefreshTokenFromCookies() {
  const c = await cookies();
  return c.get(REFRESH_TOKEN_NAME)?.value || null;
}

export async function getAccessTokenFromCookies() {
  const c = await cookies();
  return c.get(ACCESS_TOKEN_NAME)?.value || null;
}

export { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME };
