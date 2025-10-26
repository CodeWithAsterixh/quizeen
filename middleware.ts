import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { generateCsrfToken } from "./lib/security/csrf";
import { validateEnv } from './lib/env';

// Run environment validation early in middleware initialization.
// This throws during startup if required env vars are missing.
validateEnv();

export function middleware(request: NextRequest) {
  // Get navigation information
  const to = request.nextUrl.pathname;
  const referrer = request.headers.get("referer");
  const from = referrer ? new URL(referrer).pathname : undefined;

  let response: NextResponse;

  // Handle auth page redirects (login and register)
  if (to === "/auth/login" || to === "/auth/register") {
    const url = new URL(to, request.url);
    
    // Case 1: Coming from a non-auth page, set new redirect
    if (!request.nextUrl.searchParams.has("redirect") && 
        from && 
        !from.startsWith("/auth")) {
      console.log(`${to.split("/").pop()} page access - setting new redirect`);
      const redirectData = {
        from,
        redirect: true,
      };
      url.searchParams.set("redirect", JSON.stringify(redirectData));
      response = NextResponse.redirect(url);
    }
    // Case 2: Coming from another auth page, preserve existing redirect
    else if (from?.startsWith("/auth")) {
      console.log(`Auth page navigation - checking redirects`);
      const sourceUrl = new URL(referrer || "");
      const existingRedirect = sourceUrl.searchParams.get("redirect");
      const currentRedirect = request.nextUrl.searchParams.get("redirect");

      // Only redirect if the redirect params are different
      if (existingRedirect && existingRedirect !== currentRedirect) {
        console.log(`Different redirect params - updating URL`);
        url.searchParams.set("redirect", existingRedirect);
        response = NextResponse.redirect(url);
      } else {
        console.log(`Same or no redirect params - continuing`);
        response = NextResponse.next();
      }
    } else {
      response = NextResponse.next();
    }
  } 
  // Protected routes check
  else if (request.nextUrl.pathname.startsWith("/account")) {
    const token = request.cookies.get("token");
    if (!token) {
      response = NextResponse.redirect(new URL("/auth/login", request.url));
    } else {
      response = NextResponse.next();
    }
  } else {
    response = NextResponse.next();
  }

  // Only set initial CSRF token if it doesn't exist
  if (
    (request.nextUrl.pathname.startsWith("/auth") ||
      request.nextUrl.pathname.startsWith("/api")) &&
    !request.cookies.has("csrf_token")
  ) {
    const token = generateCsrfToken();

    // Set httpOnly cookie for server validation
    response.cookies.set("csrf_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    // Set header for client-side access
    response.headers.set("x-csrf-token", token);
  } else if (request.cookies.has("csrf_token")) {
    // If token exists, pass it through in header
    const existingToken = request.cookies.get("csrf_token")?.value;
    if (existingToken) {
      response.headers.set("x-csrf-token", existingToken);
    }
  }

  // set referrer headers
  if (from) {
    response.headers.set("x-referrer-path", from);
  }
  response.headers.set("x-navigated-to", to);

  // Security Headers
  const headers = response.headers;

  // Prevent browsers from performing MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === "production") {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Control how much referrer information should be included with requests
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Prevent the page from being displayed in an iframe
  headers.set("X-Frame-Options", "DENY");

  // Control browser features and APIs
  headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"
  );

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "media-src 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-src 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  return response;
}

export const config = {
  matcher: [
    // Apply to all routes except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
