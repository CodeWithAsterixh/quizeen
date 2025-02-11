import { connectToDatabase } from "@/lib/mongo";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// POST /api/auth/login
export async function POST(req: Request) {

  try {
    await connectToDatabase()
    const { email, password } = await req.json();
    const users = await User.find();
    const user = await User.findOne({ email });
    if (users.length===0||!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordIsValid) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 400 });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

    return NextResponse.json({ token });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
