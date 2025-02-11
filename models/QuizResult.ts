import mongoose, { Document, Schema } from "mongoose";

// Interface for the result of each question in a quiz
export interface IQuestionResult {
  questionId: string;         // ID of the question
  userAnswer: string;         // The answer selected by the user ('A', 'B', 'C', 'D')
  correctAnswer: string;      // The correct answer ('A', 'B', 'C', 'D')
  isCorrect: boolean;         // Whether the user's answer was correct or not
  timeTaken: string;          // Time taken to answer the question (in seconds or another format)
}

// Interface for QuizResult document
export interface IQuizResult extends Document {
  quizId: string;             // ID of the quiz
  userId: string;             // ID of the user who submitted the quiz
  score: number;              // User's score (number of correct answers)
  totalQuestions: number;     // Total number of questions in the quiz
  details: IQuestionResult[]; // Array of detailed results for each question
  completionTime: string;     // Time taken by the user to complete the quiz
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema for QuizResult
const QuizResultSchema: Schema<IQuizResult> = new Schema(
  {
    quizId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    details: [
      {
        questionId: { type: String, required: true },
        userAnswer: { type: String, required: true },
        correctAnswer: { type: String, required: true },
        isCorrect: { type: Boolean, required: true },
        timeTaken: { type: String, required: true },
      },
    ],
    completionTime: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the QuizResult model
const QuizResult = mongoose.models.QuizResult || mongoose.model<IQuizResult>("QuizResult", QuizResultSchema);

export { QuizResult };
