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
  await connectToDatabase()
  
  try {
    // Accept submission payload. Answers may be either a map of question index -> selected option ("A"|"B"..)
    // or a richer object { answer: "A", timeTaken: "00:12" } if the frontend records per-question timings.
    const body = await req.json() as QuestionResultSubmission & { startedAt?: string };
    let { quizId, userId: bodyUserId, answers, role: bodyRole, saveResult, startedAt } = body;

    // If quizId was not provided in body, try to parse it from the request URL path (/api/quizzes/:quizId/submit)
    if (!quizId) {
      try {
        const url = new URL((req as any).url);
        const parts = url.pathname.split("/").filter(Boolean);
        // parts might be ["api","quizzes",":quizId","submit"]
        const quizIndex = parts.findIndex((p) => p === "quizzes");
        if (quizIndex >= 0 && parts.length > quizIndex + 1) {
          quizId = parts[quizIndex + 1];
        }
      } catch (e) {
        // ignore
      }
    }

    // Try to recover userId and role from Authorization header or HttpOnly cookie if present.
    let token: string | null = null;
    const authHeader = (req.headers && (req as any).headers.get("authorization")) || null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "");
    } else {
      const cookieHeader = (req.headers && (req as any).headers.get("cookie")) || null;
      if (cookieHeader) {
        const parsed = Object.fromEntries(cookieHeader.split(";").map((s: string) => s.trim().split("=").map(decodeURIComponent)) as [string,string][]);
        token = parsed['token'] || parsed['authToken'] || null;
      }
    }

    let derivedUserId = bodyUserId || "";
    let derivedRole = bodyRole || "guest";
    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const decoded: any = jwt.verify(token, JWT_SECRET);
        if (decoded?.userId) derivedUserId = decoded.userId;
        if (decoded?.role) derivedRole = decoded.role;
      } catch (e) {
        // ignore invalid token; we fallback to provided body values
      }
    }

    // Fetch the quiz document from DB. We need question list and correct answers to mark the quiz.
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return NextResponse.json({ message: "Quiz not found" }, { status: 404 });
    }
    const role = derivedRole as string;
    const finalUserId = derivedUserId as string;

    if (role === "none") {
      return NextResponse.json({ message: "Not allowed" }, { status: 404 });
    }
    // MARKING ALGORITHM
    // 1. For each question in the quiz (preserve order), pull the submitted answer.
    //    The frontend may send answers keyed by question index (1-based) or by questionId.
    //    We support both. If the submitted answer is an object with { answer, timeTaken } we use those fields.
    // 2. Determine correctness by comparing submitted answer to question.correctAnswer.
    // 3. Tally score and produce a details array with questionId, userAnswer, correctAnswer, isCorrect, timeTaken.
    // 4. Compute completionTime as the difference between startedAt (if provided) and now, formatted as mm:ss. If startedAt missing, set to "unknown".

    let score = 0;
    // Build details array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // Cast answers to any for flexible indexing (support both numeric and string keys).
    const answersAny: any = answers as any;
    const details: details[] = quiz.questions.map((question: any, ind: number) => {
      // Try index-based key (1-based) first, then questionId key
      const idxKey = `${ind + 1}`;
      const byIndex = answersAny ? (answersAny[idxKey] as any) : undefined;
      const byId = answersAny ? (answersAny[question._id] as any) : undefined;
      const submission = byIndex ?? byId;

      // submission can be either a string ("A") or an object { answer: "A", timeTaken: "00:12" }
      let userAnswer: string | undefined = undefined;
      // Default timeTaken to 00:00 when frontend did not provide per-question timing.
      let timeTaken = "00:00";
      if (submission) {
        if (typeof submission === "string") {
          userAnswer = submission;
        } else if (typeof submission === "object" && submission.answer) {
          userAnswer = submission.answer;
          if (submission.timeTaken) timeTaken = submission.timeTaken;
        }
      }

      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) score++;

      return {
        questionId: question._id,
        userAnswer: userAnswer || "",
        correctAnswer: question.correctAnswer,
        isCorrect,
        timeTaken: timeTaken || "00:00",
        // include a snapshot of the question to help reconstruct attempts later
        questionText: question.text,
        options: question.options,
      } as any as details;
    });

    const correctAnswers = details.filter((d) => d.isCorrect).length;
    const totalQuestions = quiz.questions.length;

    // Compute completion time (mm:ss) if startedAt provided
    let completionTime = "unknown";
    if (startedAt) {
      try {
        const start = new Date(startedAt).getTime();
        const now = Date.now();
        const diffMs = Math.max(0, now - start);
        const secs = Math.floor(diffMs / 1000);
        const mm = Math.floor(secs / 60)
          .toString()
          .padStart(2, "0");
        const ss = (secs % 60).toString().padStart(2, "0");
        completionTime = `${mm}:${ss}`;
      } catch (e) {
        completionTime = "unknown";
      }
    }

    // Prepare the payload we will return to the client. For guests or when saveResult=false we do not persist.
    const responsePayload: QuizAttempt = {
      _id: new mongoose.Types.ObjectId(),
      quizId,
      userId: finalUserId || "",
      score,
      totalQuestions,
      correctAnswers,
      details,
      completionTime,
      createdAt: new Date().toISOString(),
    } as QuizAttempt;

    // If user is guest or they explicitly chose not to save, just return computed result without persisting.
    if (role === "guest" || !saveResult || !finalUserId) {
      return NextResponse.json(responsePayload);
    }

    // Persist result for authenticated users
    const result = new QuizResult({
      ...responsePayload,
      userId: finalUserId || "",
    });
    await result.save();
    return NextResponse.json(result);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.log("Quiz submission error:", error);
    return NextResponse.json({ message: "Failed to submit quiz" }, { status: 500 });
  }
}
