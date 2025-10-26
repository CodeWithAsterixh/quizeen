/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizAttempt, selectedOptions } from "@/types";
import { authInterceptorNext } from "@/utils/authInterceptorNext";

interface SubmitQuizParams {
  currentQuizId: string;
  userId: string;
  answers: Record<number, selectedOptions>;
  role: "student" | "admin" | "guest";
  saveResults: boolean;
  setResultProcess: (rep: {
    result?: QuizAttempt;
    status: "loading" | "processed" | "not loaded";
    answers: Record<number, selectedOptions>;
  }) => void;
  setEnd?: (end: boolean, answers: Record<number, selectedOptions>) => void;
}

export const useSubmitQuiz = ({
  currentQuizId,
  userId,
  answers,
  role,
  saveResults,
  setResultProcess,
  setEnd,
}: SubmitQuizParams) => {
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const { push } = useRouter();

  const handleSubmit = useCallback(async () => {
    // Set result process to loading
    setResultProcess({
      status: "loading",
      answers,
    });

    // Dispatch the submitQuiz action
    // Try to include startedAt from localStorage ongoingQuizzes if present (helps compute completionTime server-side)
    let startedAt: string | undefined = undefined;
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("ongoingQuizzes");
        if (raw) {
          const arr = JSON.parse(raw) as any[];
          const entry = arr.find((a) => a.quizId === currentQuizId);
          if (entry && entry.startedAt) startedAt = entry.startedAt;
        }
      }
    } catch{
      // ignore
    }

    const res = await dispatch(
      submitQuiz({
        quizId: currentQuizId,
        userId: userId,
        answers,
        role,
        saveResult: saveResults,
        startedAt,
      } as any)
    );

    // Check for errors in the response
    if (res.meta.requestStatus === "rejected") {
      toast({
        variant: "destructive",
        description: "Your answers were not submitted successfully",
      });
      setResultProcess({
        status: "not loaded",
        answers,
      });
    } else {
      // If provided, mark the quiz as ended (only on success)
      if (setEnd) setEnd(true, answers);

      // continue to handle success
      if (role === "guest") {
        const next = JSON.stringify(authInterceptorNext({url:`/quizzes/${currentQuizId}`, action:'quiz-submit'}))
        toast({
          variant: "success",
          description: "Here is your result",
          action: (
            <Button onClick={() => push(`/auth/login?_next=${next}`)}>
              Save now
            </Button>
          ),
        });
      } else {
        toast({
          title: "Here is your result",
          variant: "success",
        });
      }
      setResultProcess({
        status: "processed",
        result: res.payload as QuizAttempt,
        answers,
      });
    }
  }, [
    answers,
    currentQuizId,
    dispatch,
    push,
    role,
    saveResults,
    setResultProcess,
    setEnd,
    toast,
    userId,
  ]);

  return { handleSubmit };
};
