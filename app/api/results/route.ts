import { connectToDatabase } from "@/lib/mongo";
import { QuizResult } from "@/models/QuizResult";
import { NextRequest, NextResponse } from "next/server";

// POST /api/quizzes/submit
export async function GET(req: NextRequest) {
  await connectToDatabase();
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("uid");
  const _id = searchParams.get("rid");
  const quizId = searchParams.get("qid");

  try {
    if (userId) {
      const result = await QuizResult.find({ userId });
      return NextResponse.json(result);
    }else if (_id) {
      const result = await QuizResult.find({ _id });
      return NextResponse.json(result);
    }else if (quizId) {
      const result = await QuizResult.find({ quizId });
      return NextResponse.json(result);
    }else{
      return NextResponse.json([]);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
