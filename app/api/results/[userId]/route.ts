import { connectToDatabase } from "@/lib/mongo";
import { QuizResult } from "@/models/QuizResult";
import { NextResponse } from "next/server";

// POST /api/quizzes/submit
export async function GET(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  await connectToDatabase()
  
  try {
    const { userId } =await params;
    const result= await QuizResult.find({userId});
          
    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: "Failed to submit quiz" }, { status: 500 });
  }
}
