import { connectToDatabase } from "@/lib/mongo";
import { Quiz } from "@/models/Quiz";
import { Quiz as quizType } from "@/types";
import { NextResponse } from "next/server";

// GET /api/quizzes
export async function POST(req:Request) {
  try {
    await connectToDatabase()
    const {title, description,duration,questions,createdBy,createdAt,updatedAt} = await req.json() as quizType
    // const quizzes =Quiz.find();
    const newQuiz = new Quiz({
      title,
      description,
      duration,
      questions,
      createdBy,
      createdAt,
      updatedAt,
    })

    await newQuiz.save()
    return NextResponse.json({message: "Quiz saved successfully"});
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Failed to fetch quizzes" }, { status: 500 });
  }
}
