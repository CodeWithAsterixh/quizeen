import { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';

interface QuizTimingState {
  started: boolean;
  timeLeft: number;
  ended: boolean;
}

export const useQuizTiming = () => {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const [quizTiming, setQuizTiming] = useState<QuizTimingState>({
    started: false,
    timeLeft: 0,
    ended: false,
  });

  useEffect(() => {
    if (currentQuiz) {
      setQuizTiming((qt) => ({
        ...qt,
        timeLeft: currentQuiz.duration,
      }));
    }
  }, [currentQuiz]);

  const startQuiz = () => {
    setQuizTiming((qt) => ({
      ...qt,
      started: true,
    }));
  };

  const endQuiz = (ended: boolean) => {
    setQuizTiming((qt) => ({
      ...qt,
      ended,
    }));
  };

  const setTimeLeft = (timeLeft: number) => {
    setQuizTiming((qt) => ({
      ...qt,
      timeLeft,
    }));
  };

  return useMemo(() => ({
    quizTiming,
    startQuiz,
    endQuiz,
    setTimeLeft,
  }), [quizTiming, startQuiz, endQuiz, setTimeLeft]);
};