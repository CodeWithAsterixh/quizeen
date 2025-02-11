import { connectToDatabase } from "@/lib/mongo";
import { Quiz } from "@/models/Quiz";
import { NextResponse } from "next/server";

// GET /api/quizzes
export async function GET() {
  try {
    await connectToDatabase()
    const quizzes =Quiz.find();
    
    return NextResponse.json(await quizzes.exec());
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Failed to fetch quizzes" }, { status: 500 });
  }
}
