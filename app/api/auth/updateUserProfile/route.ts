/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/mongo";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function PUT(request: Request) {
  await connectToDatabase();

  // Token may be provided via Authorization header or cookies (authToken/token)
  let token: string | null = null;
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '');
  } else {
    const cookieHeader = request.headers.get('cookie') || request.headers.get('Cookie') || '';
    const parsed = Object.fromEntries(
      cookieHeader ? cookieHeader.split(';').map((s) => s.trim().split('=').map(decodeURIComponent)) : []
    ) as Record<string, string>;
    token = parsed['authToken'] || parsed['token'] || null;
  }

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    return NextResponse.json({ message: 'Invalid or expired token', error: error.message }, { status: 401 });
  }
  
  // Parse the request body for updated data
  const { fullName, email } = await request.json();

  try {
    // Find the user by the ID from the token and update the profile
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId, 
      { fullName, email },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Convert to a plain object and remove sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, __v, ...userData } = updatedUser.toObject();

    return NextResponse.json({ user: userData, token });
  } catch (error: any) {
    return NextResponse.json({ message: "Profile update failed", error: error.message }, { status: 500 });
  }
}
