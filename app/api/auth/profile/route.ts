/* eslint-disable @typescript-eslint/no-unused-vars */
import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/models/User";
import { User as userType} from "@/types";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  // Connect to MongoDB
  await connectToDatabase();

  // Get the Authorization header
  // Try Authorization header first, then fall back to reading cookie header (for HttpOnly access tokens)
  let token: string | null = null;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "");
  } else {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const parsed = Object.fromEntries(cookieHeader.split(';').map((s) => s.trim().split('=').map(decodeURIComponent)) as [string,string][]);
      token = parsed['token'] || parsed['authToken'] || null;
    }
  }

  if (!token) {
    return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
  }

  try {
    // Verify the token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Convert to plain object and remove sensitive fields (like passwordHash and __v)
    const { passwordHash, __v, ...userData } = user.toObject();

    return NextResponse.json({ user: userData, token });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: "Invalid or expired token", error: error.message }, { status: 401 });
  }
}


export async function POST(request: Request) {
  // Connect to MongoDB
  await connectToDatabase();
  
  // get body
  const body = await request.json() as userType
  // Try Authorization header first, then fall back to reading cookie header (for HttpOnly access tokens)
  let token: string | null = null;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "");
  } else {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const parsed = Object.fromEntries(cookieHeader.split(';').map((s) => s.trim().split('=').map(decodeURIComponent)) as [string,string][]);
      token = parsed['token'] || parsed['authToken'] || null;
    }
  }

  if (!token) {
    return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
  }

  try {
    // Verify the token
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findByIdAndUpdate(decoded.userId, body, {new:true});
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Convert to plain object and remove sensitive fields (like passwordHash and __v)
    const { passwordHash, __v, ...userData } = user.toObject();

    return NextResponse.json({ user: userData, token });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: "Invalid or expired token", error: error.message }, { status: 401 });
  }
}