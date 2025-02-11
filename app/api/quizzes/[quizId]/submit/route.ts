import { NextResponse } from "next/server";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";
import { QuizResult } from "@/models/QuizResult";
import { connectToDatabase } from "@/lib/mongo";
import { details } from "@/types";

// POST /api/quizzes/submit
export async function POST(req: Request) {
  await connectToDatabase()
  
  try {
    const { quizId, userId, answers } = await req.json();
          
      // Access the quizId from params
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    let score = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details:details[] = quiz.questions.map((question: { _id: string | number; correctAnswer: any; }, ind:number) => {
      const userAnswer = answers[`${ind+1}`]
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: question._id,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeTaken: "00:30", // This can be added as part of the submission process
      };
    });


    const result = new QuizResult({
      quizId,
      userId,
      score,
      totalQuestions: quiz.questions.length,
      details,
      completionTime: "15:00", // Example time; can be captured in the frontend
    });

    await result.save();
    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: "Failed to submit quiz" }, { status: 500 });
  }
}
