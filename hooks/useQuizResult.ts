import { useState, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { setUnknownState } from '@/lib/features/unknownSlice';
import { QuizAttempt, selectedOptions } from '@/types';

interface ResultProcessState {
  result?: QuizAttempt;
  status: "loading" | "processed" | "not loaded";
  answers: Record<number, selectedOptions>;
}

export const useQuizResult = () => {
  const dispatch = useAppDispatch();
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const [resultProcess, setResultProcess] = useState<ResultProcessState>({
    status: "not loaded",
    answers: {},
  });

  const handleEnd = useCallback(
    (end: boolean, answers: Record<number, selectedOptions>) => {
      dispatch(
        setUnknownState({
          state: {
            quizId: currentQuiz?._id || "",
            answers,
          },
          from: "quiz-submit",
        })
      );
      setResultProcess((re) => ({
        ...re,
        answers,
      }));
    },
    [currentQuiz?._id, dispatch]
  );

  const setResult = useCallback((result: QuizAttempt) => {
    setResultProcess((re) => ({
      ...re,
      result,
      status: "processed",
    }));
  }, []);

  const updateResultProcess = useCallback((newState: Partial<ResultProcessState>) => {
    setResultProcess((re) => ({
      ...re,
      ...newState,
    }));
  }, []);

  const setLoading = useCallback(() => {
    setResultProcess((re) => ({
      ...re,
      status: "loading",
    }));
  }, []);

  const resetResult = useCallback(() => {
    setResultProcess({
      status: "not loaded",
      answers: {},
    });
  }, []);

  return useMemo(() => ({
    resultProcess,
    handleEnd,
    setResult,
    setLoading,
    resetResult,
    updateResultProcess,
  }), [resultProcess, handleEnd, setResult, setLoading, resetResult, updateResultProcess]);
};