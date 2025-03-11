import { selectedOptions } from "@/types";
import { useCallback, useState } from "react";

interface QuizNavigationState {
  current: number;
  status: "not-finished" | "finished" | "submitted";
}

export const useQuestionNavigation = (totalQuestions: number) => {
  const [quizState, setQuizState] = useState<QuizNavigationState>({
    current: 0,
    status: "not-finished",
  });
  const [answers, setAnswers] = useState<Record<number, selectedOptions>>({});
 

  const handleNext = useCallback(() => {
    setQuizState((st) => {
      if (st.current === totalQuestions - 1) {
        return { ...st, status: "finished" };
      }
      return { current: st.current + 1, status: "not-finished" };
    });
  }, [totalQuestions]);

  const handlePrev = useCallback(() => {
    setQuizState((st) => {
      if (st.current === 0) return st;
      return { current: st.current - 1, status: "not-finished" };
    });
  }, []);

  const updateAnswer = useCallback((questionIndex: number, option: selectedOptions) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex + 1]: option,
    }));

  }, []);

  return {
    quizState,
    answers,
    handleNext,
    handlePrev,
    updateAnswer,
    setQuizState, // exposed if you need to manually set status
  };
};
