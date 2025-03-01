import { useCallback } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { QuizAttempt, selectedOptions } from "@/types";

interface SubmitQuizParams {
  currentQuizId: string;
  userId: string;
  answers: Record<number, selectedOptions>;
  role: "user" | "admin" | "guest";
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
    const res = await dispatch(
      submitQuiz({
        quizId: currentQuizId,
        userId: userId,
        answers,
        role,
        saveResult: saveResults,
      })
    );

    // If provided, mark the quiz as ended
    if (setEnd) setEnd(true, answers);

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
      if (role === "guest") {
        toast({
          variant: "success",
          description: "Here is your result",
          action: (
            <Button onClick={() => push("/auth/login")}>
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
