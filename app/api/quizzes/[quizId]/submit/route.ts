/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/mongo";
import { Quiz } from "@/models/Quiz";
import { QuizResult } from "@/models/QuizResult";
import { details, QuestionResultSubmission, QuizAttempt } from "@/types";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;


// POST /api/quizzes/submit
export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json() as QuestionResultSubmission & { startedAt?: string };
    const { quizId, userId: bodyUserId, answers, role: bodyRole, saveResult, startedAt } = body;

    const resolvedQuizId = quizId || extractQuizIdFromPath(req);
    if (!resolvedQuizId) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const { userId: finalUserId, role } = await resolveUser(bodyUserId, bodyRole, req);
    if (role === "none") {
      return NextResponse.json({ message: "Not allowed" }, { status: 404 });
    }

    const quiz = await Quiz.findById(resolvedQuizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }

    const details = buildDetails(quiz.questions, answers);
    const score = details.filter(d => d.isCorrect).length;
    const totalQuestions = quiz.questions.length;
    const completionTime = computeCompletionTime(startedAt);

    const responsePayload: QuizAttempt = {
      _id: new mongoose.Types.ObjectId(),
      quizId: resolvedQuizId,
      userId: finalUserId || "",
      score,
      totalQuestions,
      correctAnswers: score,
      details,
      completionTime,
      createdAt: new Date().toISOString(),
    };

    if (role === "guest" || !saveResult || !finalUserId) {
      return NextResponse.json(responsePayload);
    }

    const result = new QuizResult({ ...responsePayload, userId: finalUserId });
    await result.save();
    return NextResponse.json(result);
  } catch (error) {
    console.log("Quiz submission error:", error);
    return NextResponse.json({ message: "Failed to submit quiz" }, { status: 500 });
  }
}

function extractQuizIdFromPath(req: Request): string | null {
  try {
    const url = new URL((req as any).url);
    const parts = url.pathname.split("/").filter(Boolean);
    const quizIndex = parts.indexOf("quizzes");
    return parts[quizIndex + 1] || null;
  } catch {
    return null;
  }
}

async function resolveUser(bodyUserId: string | undefined, bodyRole: string | undefined, req: Request): Promise<{ userId: string; role: string }> {
  const token = extractToken(req);
  if (!token) {
    return { userId: bodyUserId || "", role: bodyRole || "guest" };
  }
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded?.userId || bodyUserId || "",
      role: decoded?.role || bodyRole || "guest",
    };
  } catch {
    return { userId: bodyUserId || "", role: bodyRole || "guest" };
  }
}

function extractToken(req: Request): string | null {
  const authHeader = (req.headers && (req as any).headers.get("authorization")) || null;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }
  const cookieHeader = (req.headers && (req as any).headers.get("cookie")) || null;
  if (!cookieHeader) return null;
  const parsed = Object.fromEntries(
    cookieHeader.split(";").map((s: string) => s.trim().split("=").map(decodeURIComponent)) as [string, string][]
  );
  return parsed['token'] || parsed['authToken'] || null;
}

function buildDetails(questions: any[], answers: any): details[] {
  const answersAny = answers;
  return questions.map((question: any, ind: number) => {
    const idxKey = `${ind + 1}`;
    const submission = answersAny?.[idxKey] ?? answersAny?.[question._id];
    const { userAnswer, timeTaken } = parseSubmission(submission);
    const isCorrect = userAnswer === question.correctAnswer;
    return {
      questionId: question._id,
      userAnswer: userAnswer || "",
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeTaken: timeTaken || "00:00",
      questionText: question.text,
      options: question.options,
    } as any as details;
  });
}

function parseSubmission(submission: any): { userAnswer?: string; timeTaken: string } {
  if (typeof submission === "string") {
    return { userAnswer: submission, timeTaken: "00:00" };
  }
  if (typeof submission === "object" && submission?.answer) {
    return { userAnswer: submission.answer, timeTaken: submission.timeTaken || "00:00" };
  }
  return { timeTaken: "00:00" };
}

function computeCompletionTime(startedAt?: string): string {
  if (!startedAt) return "unknown";
  try {
    const start = new Date(startedAt).getTime();
    const diffMs = Math.max(0, Date.now() - start);
    const secs = Math.floor(diffMs / 1000);
    const mm = Math.floor(secs / 60).toString().padStart(2, "0");
    const ss = (secs % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  } catch {
    return "unknown";
  }
}
