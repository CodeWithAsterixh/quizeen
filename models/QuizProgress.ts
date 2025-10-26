import mongoose, { Document, Schema } from "mongoose";

export interface IQuizProgress extends Document {
  quizId: string;
  userId?: string;
  startedAt: Date;
  lastSavedAt: Date;
  answers?: any;
}

const QuizProgressSchema: Schema<IQuizProgress> = new Schema(
  {
    quizId: { type: String, required: true },
    userId: { type: String, required: false },
    startedAt: { type: Date, required: true },
    lastSavedAt: { type: Date, required: true },
    answers: { type: Schema.Types.Mixed, default: {} },
  },
  {
    collection: "quizprogress",
    timestamps: true,
  }
);

const QuizProgress = mongoose.models.QuizProgress || mongoose.model<IQuizProgress>("QuizProgress", QuizProgressSchema);

export { QuizProgress };
