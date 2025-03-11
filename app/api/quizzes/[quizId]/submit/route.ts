import { connectToDatabase } from "@/lib/mongo";
import { Quiz } from "@/models/Quiz";
import { QuizResult } from "@/models/QuizResult";
import { details, QuestionResultSubmission, QuizAttempt } from "@/types";
import mongoose from "mongoose";
import { NextResponse } from "next/server";


// POST /api/quizzes/submit
export async function POST(req: Request) {
  await connectToDatabase()
  
  try {
    const { quizId, userId, answers, role, saveResult } = await req.json() as QuestionResultSubmission;
          
      // Access the quizId from params
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }
    if (role === "none") {
      return NextResponse.json({ message: "Not allowed" }, { status: 404 });
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
      }
    });
    const resultWithoutUser:QuizAttempt = {
      quizId,
      score,
      userId:"",
      totalQuestions: quiz.questions.length,
      details,
      completionTime: "15:00", // Example time; can be captured in the frontend
      _id:new mongoose.Types.ObjectId(),
      correctAnswers:details.filter(d=>d.isCorrect).length,
      createdAt: (new Date()).toISOString()
    }



    
    if(role==="guest" || !saveResult){
    return NextResponse.json(resultWithoutUser);

    }

    const result = new QuizResult({
      ...resultWithoutUser,
      userId
    });

    await result.save();
    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ message: "Failed to submit quiz" }, { status: 500 });
  }
}
