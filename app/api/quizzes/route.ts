import { connectToDatabase } from "@/lib/mongo";
import { Quiz } from "@/models/Quiz";
import { NextResponse } from "next/server";
import { Quiz as quizType } from "@/types";
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



// GET /api/quizzes
export async function POST(req:Request) {
  try {
    await connectToDatabase()
    const {title, description,duration,questions,createdBy,createdAt,updatedAt} = await req.json() as quizType
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
// GET /api/quizzes
export async function PATCH(req:Request) {
  try {
    await connectToDatabase()
    const body = await req.json() as quizType
    
    await Quiz.updateOne({
      ...body
    })
    return NextResponse.json({message: "Quiz updated successfully"});
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Failed to update quiz" }, { status: 500 });
  }
}
