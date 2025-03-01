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

// PUT /api/quizzes/[quizId]
export async function PUT(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  // Connect to the database
  await connectToDatabase();

  try {
    // Get updated data from the request body
    const updatedData = await request.json();
    const { quizId } =await params;

    console.log(updatedData)

    // Update the quiz and return the new document
    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, updatedData, { new: true });

    if (!updatedQuiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { message: "Failed to update quiz", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[quizId]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  // Connect to the database
  await connectToDatabase();

  try {
    // Await the params promise and extract quizId
    const { quizId } = await params;

    // Find the quiz by ID and delete it
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);

    if (!deletedQuiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quiz deleted successfully" });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { message: "Failed to delete quiz", error: error.message },
      { status: 500 }
    );
  }
}