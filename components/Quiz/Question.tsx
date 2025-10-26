/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup } from "@/components/ui/radio-group";
import { useQuestionNavigation } from "@/hooks/useQuestionNavigation";
import { useSubmitQuiz } from "@/hooks/useSubmitQuiz";
import { useAppSelector } from "@/lib/hooks";
import { selectedOptions, QuizAttempt } from "@/types";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import OptionCard from "../OptionCard";

type QuestionComponentProps = {
  setEnd?: (end: boolean, answers: Record<number, selectedOptions>) => void;
  setResultProcess: (rep: {
    result?: QuizAttempt;
    status: "loading" | "processed" | "not loaded";
    answers: Record<number, selectedOptions>;
  }) => void;
  reSave: boolean;
  show:boolean
};

const QuestionComponent: React.FC<QuestionComponentProps> = ({
  setResultProcess,
  setEnd,
  reSave,
  show
}) => {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { loading } = useAppSelector((s) => s.quiz);
  const { user, role } = useAppSelector((s) => s.auth);
  const { saveResults } = useAppSelector((s) => s.settings);

  const {
    quizState,
    answers,
    handleNext,
    handlePrev,
    updateAnswer,
    setQuizState,
    setAnswers,
  } = useQuestionNavigation(currentQuiz?.questions.length || 0);

  // Persist current answers to localStorage for resume/refresh
  useEffect(() => {
    try {
      const key = "ongoingQuizzes";
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const arr = JSON.parse(raw) as any[];
      const idx = arr.findIndex((a) => a.quizId === currentQuiz?._id);
      if (idx >= 0) {
        arr[idx].answers = answers;
        arr[idx].lastSavedAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(arr));
      }
    } catch{
      // ignore
    }
  }, [answers, currentQuiz]);

  // Use our custom hook to get handleSubmit for quiz submission.
  const { handleSubmit } = useSubmitQuiz({
    currentQuizId: currentQuiz?._id || "",
    userId: user?._id || "",
    answers,
  role: role as "student" | "admin" | "guest",
    saveResults,
    setResultProcess,
    setEnd,
  });

  useEffect(() => {
    if (reSave) {
      handleSubmit();
    }
  }, [reSave, handleSubmit]);

  // On mount, try to populate answers from localStorage (or server-synced local copy)
  useEffect(() => {
    try {
      const key = "ongoingQuizzes";
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const arr = JSON.parse(raw) as any[];
      const entry = arr.find((a) => a.quizId === currentQuiz?._id);
      if (entry && entry.answers) {
        setAnswers(entry.answers);
        // set current to the last answered question index (or keep at 0)
        const answeredIndexes = Object.keys(entry.answers)
          .map((k) => Number(k))
          .filter((n) => !Number.isNaN(n))
          .sort((a, b) => a - b);
        if (answeredIndexes.length > 0) {
          const last = Math.max(...answeredIndexes) - 1; // zero-based
          setQuizState((st) => ({ ...st, current: Math.min(last, (currentQuiz?.questions.length || 1) - 1) }));
        }
      }
    } catch{
      // ignore
    }
  // run once on mount or when quiz changes
  }, [currentQuiz, setAnswers, setQuizState]);

  // Listen for updates to ongoing progress (e.g., merged server progress)
  useEffect(() => {
    const handler = (ev: any) => {
      try {
        const quizId = ev?.detail?.quizId;
        if (!quizId || quizId !== currentQuiz?._id) return;
        const key = "ongoingQuizzes";
        const raw = localStorage.getItem(key);
        if (!raw) return;
        const arr = JSON.parse(raw) as any[];
        const entry = arr.find((a) => a.quizId === currentQuiz?._id);
        if (entry && entry.answers) {
          setAnswers(entry.answers);
          const answeredIndexes = Object.keys(entry.answers)
            .map((k) => Number(k))
            .filter((n) => !Number.isNaN(n))
            .sort((a, b) => a - b);
          if (answeredIndexes.length > 0) {
            const last = Math.max(...answeredIndexes) - 1; // zero-based
            setQuizState((st) => ({ ...st, current: Math.min(last, (currentQuiz?.questions.length || 1) - 1) }));
          }
        }
      } catch{
        // ignore
      }
    };
    window.addEventListener('ongoingProgressUpdated', handler as EventListener);
    return () => window.removeEventListener('ongoingProgressUpdated', handler as EventListener);
  }, [currentQuiz, setAnswers, setQuizState]);

  const currentQuestion = currentQuiz?.questions[quizState.current];

  if(!show)return null
  if (!currentQuiz || !currentQuestion) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {quizState.status !== "submitted" && (
        <Card className="w-full bg-neutral-200 p-2 sm:p-5">
          <CardHeader className="p-2 sm:p-6">
            <CardTitle className="text-xl font-semibold">
              {quizState.current + 1}. {currentQuestion.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-6">
            <RadioGroup
              className="grid grid-cols-1 sm:grid-cols-2"
              value={answers[quizState.current + 1]}
            >
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <OptionCard
                  key={key}
                  optionKey={key as "A" | "B" | "C" | "D"}
                  optionValue={value as string}
                  isSelected={answers[quizState.current + 1] === key}
                  onSelect={() =>
                    updateAnswer(quizState.current, key as selectedOptions)
                  }
                />
              ))}
            </RadioGroup>

            <div
              className={clsx(
                "w-full flex items-center gap-2 py-4",
                quizState.current !== 0 &&
                  quizState.current !== currentQuiz.questions.length - 1
                  ? "justify-between"
                  : "justify-end"
              )}
            >
              {quizState.current !== 0 && (
                <Button
                  variant="default"
                  onClick={() => {
                    handlePrev();
                    // persist navigation state
                    try {
                      const key = "ongoingQuizzes";
                      const raw = localStorage.getItem(key);
                      if (raw) {
                        const arr = JSON.parse(raw) as any[];
                        const idx = arr.findIndex((a) => a.quizId === currentQuiz?._id);
                        if (idx >= 0) {
                          arr[idx].lastSavedAt = new Date().toISOString();
                          arr[idx].answers = answers;
                          localStorage.setItem(key, JSON.stringify(arr));
                        }
                      }
                    } catch{
                      // ignore
                    }
                  }}
                >
                  Previous
                </Button>
              )}
              {quizState.current !== currentQuiz.questions.length - 1 ? (
                <Button
                  disabled={!answers[quizState.current + 1]}
                  onClick={() => {
                    handleNext();
                    // persist navigation state on next
                    try {
                      const key = "ongoingQuizzes";
                      const raw = localStorage.getItem(key);
                      if (raw) {
                        const arr = JSON.parse(raw) as any[];
                        const idx = arr.findIndex((a) => a.quizId === currentQuiz?._id);
                        if (idx >= 0) {
                          arr[idx].lastSavedAt = new Date().toISOString();
                          arr[idx].answers = answers;
                          localStorage.setItem(key, JSON.stringify(arr));
                        }
                      }
                    } catch{
                      // ignore
                    }
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  disabled={!answers[quizState.current + 1]}
                  onClick={handleSubmit}
                >
                  Submit {loading && <Loader2 className="animate-spin" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default QuestionComponent;
