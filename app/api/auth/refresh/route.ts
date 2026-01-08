/* eslint-disable @typescript-eslint/no-explicit-any */
import { getRefreshTokenFromCookies, setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/auth/cookies";
import { signJWT } from "@/lib/auth/jwt";
import { connectToDatabase } from "@/lib/mongo";
import { RefreshToken } from "@/models/RefreshToken";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || '';

// POST /api/auth/refresh
export async function POST() {
  try {
    await connectToDatabase();

    // Get refresh token from HttpOnly cookie
    const oldRefresh = await getRefreshTokenFromCookies();
    if (!oldRefresh) {
      return NextResponse.json({ message: "No refresh token provided" }, { status: 401 });
    }

    // Verify existing refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(oldRefresh, JWT_SECRET) as any;
    } catch {
      return NextResponse.json({ message: "Invalid refresh token" }, { status: 401 });
    }

    const tokenId = decoded.jti as string | undefined;
    const userId = decoded.userId as string | undefined;
    if (!tokenId || !userId) return NextResponse.json({ message: 'Invalid refresh token payload' }, { status: 401 });

    const dbToken = await RefreshToken.findOne({ tokenId });
    if (!dbToken || dbToken.revoked || dbToken.expiresAt < new Date()) {
      return NextResponse.json({ message: 'Refresh token revoked or expired' }, { status: 401 });
    }

    // Revoke old token and create new one
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const newTokenId = require('node:crypto').randomBytes(16).toString('hex');
    const expiresIn = 30 * 24 * 60 * 60; // 30 days
    const newRefreshJwt = jwt.sign({ userId, jti: newTokenId }, JWT_SECRET, { algorithm: 'HS256', expiresIn: `${expiresIn}s` });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn * 1000);

    dbToken.revoked = true;
    dbToken.replacedByTokenId = newTokenId;
    await dbToken.save();

    await RefreshToken.create({ tokenId: newTokenId, user: userId, createdAt: now, expiresAt, revoked: false });

    // Generate access token with up-to-date role from user doc
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    const accessToken = signJWT({ userId: user._id.toString(), role: user.role });

    const response = NextResponse.json({ ok: true });
    setAccessTokenCookie(response, accessToken);
    setRefreshTokenCookie(response, newRefreshJwt);

    return response;
  } catch (err: any) {
    console.error('refresh error', err);
    return NextResponse.json({ message: 'Failed to refresh token' }, { status: 500 });
  }
}
