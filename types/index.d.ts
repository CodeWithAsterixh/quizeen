// user.interface.ts
export interface User {
  _id: string;
  fullName: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
  role: "student" | "admin" | "creator" | "guest" | "none";
  preferences: SettingsState;
}

export interface AuthResponse {
  user: Omit<User, "passwordHash">;
  token: string;
}
// auth-payloads.interface.ts
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "student" | "creator";
}

export type selectedOptions = "A" | "B" | "C" | "D";
// quiz.interface.ts
export interface Quiz {
  _id: string;
  title: string;
  description?: string;
  duration: number; // in minutes
  questions: Question[];
  createdBy: string; // User ID
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: selectedOptions;
}

// quiz-attempt.interface.ts
interface answer {
  answer:selectedOptions,
  timeTaken:number
}
export interface QuizAttempt {
  _id: string | ObjectId;
  userId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  details: details[];
  createdAt: string;
  completionTime: string;
}

// redux-state.interface.ts
export type userRoles = "student"|"guest"|"admin"|"creator"|"none"
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  role:userRoles
}

export interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  loading: boolean;
  error: string | null;
  results: QuizResult | null;
  userCompleted: QuizAttempt[];
}

export interface SettingsState {
  theme: "light" | "dark";
  saveResults: boolean;
}

export interface QuizResult {
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  details: QuestionResult[];
}

export interface QuestionResultSubmission {
  quizId: string;
  userId?: string;
  answers: Record<number, selectedOptions>;
  role: userRoles;
  saveResult: boolean;
}

export interface QuestionResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface details {
  questionId: string;
  userAnswer: selectedOptions;
  correctAnswer: selectedOptions;
  isCorrect: boolean;
  timeTaken: string;
  _id: string;
}
