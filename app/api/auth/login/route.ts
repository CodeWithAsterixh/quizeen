import { connectToDatabase } from "@/lib/mongo";
import { signAccessToken, setTokenCookie } from "@/lib/auth/jwt";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    
    // Parse request body
    const body = await req.json();
    const email = body?.email?.toLowerCase();
    const password = body?.password;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    // Use consistent error message for security
    const invalidCredentials = { 
      error: "Invalid email or password" 
    };

    if (!user) {
      return NextResponse.json(invalidCredentials, { status: 401 });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) {
      return NextResponse.json(invalidCredentials, { status: 401 });
    }

    // Generate JWT token with user ID and role
    const token = signAccessToken({
      userId: user._id.toString(),
      role: user.role,
    });

    // Create response
    const response = NextResponse.json({ 
      user: user.toJSON(),
      success: true 
    });

    // Set secure HTTP-only cookie
    await setTokenCookie(token);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
