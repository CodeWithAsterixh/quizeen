import jwt from 'jsonwebtoken';
// cookie helpers moved to lib/auth/cookies.ts

export interface TokenPayload {
  userId: string;
  role: 'student' | 'admin' | 'creator' | 'guest' | 'none';
  iat?: number;
  exp?: number;
}

const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET at startup
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET must be provided');
}

export function signJWT(payload: TokenPayload): string {
  return jwt.sign(
    payload,
    JWT_SECRET!, // Assert JWT_SECRET is defined since we checked above
    { 
      algorithm: 'HS256',
      expiresIn: '8h'  // 8 hours
    }
  );
}

export function verifyToken(token: string): TokenPayload {
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload;
  } catch {
    throw new Error('Invalid token');
  }

  // Validate the payload structure
  if (!decoded.userId || !decoded.role || !['student', 'admin', 'creator', 'guest', 'none'].includes(decoded.role)) {
    throw new Error('Invalid token payload');
  }

  return {
    userId: decoded.userId,
    role: decoded.role as 'student' | 'admin' | 'creator' | 'guest' | 'none',
    iat: decoded.iat,
    exp: decoded.exp,
  };
}
