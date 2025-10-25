import { BadRequestError, ConflictError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongo";
import { composeMiddleware } from "@/middleware/compose";
import { authRateLimiter } from "@/middleware/rateLimiter";
import { withCsrf } from "@/middleware/withCsrf";
import { withErrorHandler } from "@/middleware/withErrorHandler";
import { User } from "@/models/User";
import { validateEmailFormat, validatePassword } from "@/utils/validators";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

async function handler(req: NextRequest) {
  await connectToDatabase();
  
  const body = await req.json() as Partial<RegisterRequest>;
  
  // Validate required fields
  if (!body.fullName?.trim() || !body.email?.trim() || !body.password || !body.confirmPassword) {
    throw new BadRequestError("All fields are required");
  }

  const { fullName, email, password, confirmPassword } = body as RegisterRequest;

  // Validate password match
  if (password !== confirmPassword) {
    throw new BadRequestError("Passwords do not match");
  }

  // Validate email format
  if (!validateEmailFormat(email)) {
    throw new BadRequestError("Invalid email format");
  }

  // Validate password requirements
  const passwordError = validatePassword(password);
  if (passwordError) {
    throw new BadRequestError(passwordError);
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError("Email is already registered");
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    fullName,
    email,
    passwordHash: hashedPassword,
    role: "user"
  });

  // Return success without exposing user details
  return NextResponse.json({ 
    message: "Registration successful",
    userId: newUser._id 
  }, { status: 201 });
}

// Apply middleware stack
export const POST = composeMiddleware(
  withErrorHandler,
  withCsrf,
  authRateLimiter
)(handler);
