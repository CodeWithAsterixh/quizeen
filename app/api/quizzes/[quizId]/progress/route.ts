/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongo";
import { QuizProgress } from "@/models/QuizProgress";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || '';

// POST /api/quizzes/[quizId]/progress
export async function POST(req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    await connectToDatabase();
    const { quizId } = await params;
    const body = await req.json();

    // expected body: { userId?, startedAt, answers? }
    const { userId, startedAt, answers } = body;
    if (!startedAt) {
      return NextResponse.json({ message: "startedAt is required" }, { status: 400 });
    }

    const started = new Date(startedAt);
    const now = new Date();

    // upsert by quizId + userId (if provided), otherwise by quizId and startedAt
    const filter: any = { quizId };
    if (userId) filter.userId = userId;

    const update = {
      $set: {
        startedAt: started,
        lastSavedAt: now,
        answers: answers || {},
      },
    };

    const options = { upsert: true, new: true } as any;

    const doc = await QuizProgress.findOneAndUpdate(filter, update, options).exec();

    return NextResponse.json({ message: "Progress saved", progress: doc });
  } catch (err: any) {
    console.error("progress save error", err);
    return NextResponse.json({ message: "Failed to save progress" }, { status: 500 });
  }
}

// GET /api/quizzes/[quizId]/progress
export async function GET(req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  try {
    await connectToDatabase();
    const { quizId } = await params;

    // Try to derive userId from Authorization header or cookie
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch{
        // ignore
      }
    } else {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const parsed = Object.fromEntries(cookieHeader.split(';').map((s) => s.trim().split('=').map(decodeURIComponent)) as [string,string][]);
        const token = parsed['token'] || parsed['authToken'] || null;
        if (token) {
          try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            userId = decoded.userId;
          } catch {
            // ignore
          }
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ message: 'No progress for anonymous user' }, { status: 404 });
    }

    const doc = await QuizProgress.findOne({ quizId, userId }).lean().exec();
    if (!doc) return NextResponse.json({});
    return NextResponse.json({ progress: doc });
  } catch (err: any) {
    console.error('progress fetch error', err);
    return NextResponse.json({ message: 'Failed to fetch progress' }, { status: 500 });
  }
}
