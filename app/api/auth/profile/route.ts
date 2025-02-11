/* eslint-disable @typescript-eslint/no-unused-vars */
import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/models/User";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  // Connect to MongoDB
  await connectToDatabase();

  // Get the Authorization header
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
  }
  
  // Extract the token from the header
  const token = authHeader.replace("Bearer ", "");

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
