import { NextResponse } from "next/server";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/mongo";

// POST /api/auth/register
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const { fullName, email, password, confirmPassword } = await req.json();

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const users = await User.find();

    if (users.length > 0 && (await User.find({ email })).length>0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      passwordHash: hashedPassword,
      role:"user"
    });

    await newUser.save();

    return NextResponse.json({ message: "User registered successfully" });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
