import { signJWT } from "@/lib/auth/jwt";
import { setAccessTokenCookie, setRefreshTokenCookie } from '@/lib/auth/cookies';
import { createRefreshToken } from '@/lib/auth/refresh';
import { AuthError } from '@/lib/errors';
import { connectToDatabase } from "@/lib/mongo";
import { validateRequest } from "@/lib/validation/validate";
import { authRateLimiter } from '@/middleware/rateLimiter';
import { withCsrf } from '@/middleware/withCsrf';
import { withErrorHandler } from '@/middleware/withErrorHandler';
import { User } from "@/models/User";
import { loginSchema } from "@/schemas/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

import type { NextRequestHandler } from '@/types/middleware';

// Login handler function
const handleLogin: NextRequestHandler = async (req) => {
  await connectToDatabase();
  
  // Validate request body
  const validation = await validateRequest(req, loginSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { email, password } = validation.data;
  const normalizedEmail = email.toLowerCase();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  // Generate JWT token with user ID and role
  const token = signJWT({
    userId: user._id.toString(),
    role: user.role,
  });

  // Create response
  const response = NextResponse.json({ user: user.toJSON(), success: true });

  // create refresh token and set both cookies on the response before returning
  const { refreshToken } = await createRefreshToken(user._id.toString());

  setAccessTokenCookie(response, token);
  setRefreshTokenCookie(response, refreshToken);

  return response;
}

// Compose middlewares
const withProtection = (handler: NextRequestHandler): NextRequestHandler => 
  withErrorHandler(authRateLimiter(withCsrf(handler)));

// POST /api/auth/login
export const POST = withProtection(handleLogin);
