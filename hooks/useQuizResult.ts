import { useState, useCallback, useMemo, useRef } from 'react';
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
  const currentQuizId = useAppSelector((s) => s.quiz.currentQuiz?._id);
  const [resultProcess, setResultProcess] = useState<ResultProcessState>({
    status: "not loaded",
    answers: {},
  });

  // Prevent dispatch loop by memoizing last sent payload
  const lastSentAnswersRef = useRef<string | null>(null);

  const handleEnd = useCallback(
    (_end: boolean, answers: Record<number, selectedOptions>) => {
      const payloadKey = JSON.stringify({ quizId: currentQuizId || "", answers });
      if (lastSentAnswersRef.current !== payloadKey) {
        lastSentAnswersRef.current = payloadKey;
        dispatch(
          setUnknownState({
            state: {
              quizId: currentQuizId || "",
              answers,
            },
            from: "quiz-submit",
          })
        );
      }
      setResultProcess((re) => ({
        ...re,
        answers,
      }));
    },
    [currentQuizId, dispatch]
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
    lastSentAnswersRef.current = null;
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