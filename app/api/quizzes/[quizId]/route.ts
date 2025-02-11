import { connectToDatabase } from "@/lib/mongo";
import { Quiz } from "@/models/Quiz";
import { NextResponse } from "next/server";

// GET /api/quizzes/[quizId]
export async function GET(req: Request, { params }: { params: Promise<{ quizId: string }> }) {
      await connectToDatabase()
  
  try {

  // Access the quizId from params
      const { quizId } =await params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }
    return NextResponse.json(quiz);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch quiz" }, { status: 500 });
  }
}
