import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { RefreshToken } from '@/models/RefreshToken';
import { connectToDatabase } from '@/lib/mongo';
import { signJWT } from './jwt';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET must be provided');

interface CreatedRefresh {
  refreshToken: string;
  tokenId: string;
}

export async function createRefreshToken(userId: string): Promise<CreatedRefresh> {
  await connectToDatabase();

  const tokenId = randomBytes(16).toString('hex');
  const expiresIn = 30 * 24 * 60 * 60; // 30 days in seconds

  const refreshToken = jwt.sign(
    { userId, jti: tokenId },
    JWT_SECRET!,
    { algorithm: 'HS256', expiresIn: `${expiresIn}s` }
  );

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresIn * 1000);

  await RefreshToken.create({ tokenId, user: userId, createdAt: now, expiresAt, revoked: false });

  return { refreshToken, tokenId };
}

export async function verifyRefreshToken(token: string) {
  await connectToDatabase();

  try {
    const decoded = jwt.verify(token, JWT_SECRET!) as jwt.JwtPayload & { jti?: string; userId?: string };
    const tokenId = decoded.jti;
    const userId = decoded.userId;
    if (!tokenId || !userId) throw new Error('Invalid refresh token payload');

    const dbToken = await RefreshToken.findOne({ tokenId });
    if (!dbToken || dbToken.revoked) throw new Error('Refresh token revoked or not found');
    if (dbToken.expiresAt < new Date()) throw new Error('Refresh token expired');

    return { tokenId, userId, dbToken };
  } catch {
    throw new Error('Invalid refresh token');
  }
}

export async function rotateRefreshToken(oldToken: string) {
  await connectToDatabase();

  const { userId, dbToken } = await verifyRefreshToken(oldToken);

  // revoke old token and create a new one
  if (dbToken.revoked) throw new Error('Token already revoked');

  const newTokenId = randomBytes(16).toString('hex');
  const expiresIn = 30 * 24 * 60 * 60; // 30 days
  const refreshToken = jwt.sign({ userId, jti: newTokenId }, JWT_SECRET!, { algorithm: 'HS256', expiresIn: `${expiresIn}s` });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresIn * 1000);

  // mark old token revoked and point to replacement
  dbToken.revoked = true;
  dbToken.replacedByTokenId = newTokenId;
  await dbToken.save();

  await RefreshToken.create({ tokenId: newTokenId, user: userId, createdAt: now, expiresAt, revoked: false });

  // create a fresh access token (student is the default non-admin role)
  const accessToken = signJWT({ userId, role: 'student' });

  return { refreshToken, accessToken };
}

export async function revokeRefreshTokenById(tokenId: string) {
  await connectToDatabase();
  const t = await RefreshToken.findOne({ tokenId });
  if (!t) return;
  t.revoked = true;
  await t.save();
}
