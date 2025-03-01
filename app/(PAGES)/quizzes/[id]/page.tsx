"use client";
import { MinuteCountdown } from "@/components/CountDown";
import GoBack from "@/components/GoBack";
import Loader from "@/components/loader";
import Details from "@/components/Quiz/Details";
import QuestionComponent from "@/components/Quiz/Question";
import ResultComponent from "@/components/ResultComponent";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSettingsUpdate } from "@/hooks/useSettingsUpdate";
import { setUnknownState } from "@/lib/features/unknownSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { QuizAttempt, selectedOptions } from "@/types";
import { DownloadIcon, Save } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";

export default function Page() {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { role } = useAppSelector((s) => s.auth);
  const { saveResults } = useAppSelector((s) => s.settings);
  const isMobile = useIsMobile();
  const { handleToggleSaveResults } = useSettingsUpdate().actions;

  const { targetRef, toPDF } = usePDF();
  const [quizTiming, setQuizTiming] = useState({
    started: false,
    timeLeft: 0,
    ended: false,
  });
  const [resultProcess, setResultProcess] = useState<{
    result?: QuizAttempt;
    status: "loading" | "processed" | "not loaded";
    answers: Record<number, selectedOptions>;
  }>({
    status: "not loaded",
    answers: {},
  });
  const [resave, setResave] = useState(false);
  const dispatch = useAppDispatch();

  function resaveResult() {
    handleToggleSaveResults();
    setResave(true);
  }

  useEffect(() => {
    if (currentQuiz) {
      setQuizTiming((qt) => ({
        ...qt,
        timeLeft: currentQuiz.duration,
      }));
    }
  }, [currentQuiz]);

  const handleEnd = useCallback(
    (end: boolean, answers: Record<number, selectedOptions>) => {
      setQuizTiming((qt) => ({
        ...qt,
        ended: end,
      }));

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

  function handleStartQuiz() {
    setQuizTiming((qt) => ({
      ...qt,
      started: true,
    }));
  }
  function handlePDF() {
    toPDF({
      canvas: {
        mimeType: "image/png",
      },
      filename: `${currentQuiz?.title}-(result)`,
      resolution: 3,
      method: "save",
      page: {
        format: "letter",
        margin: isMobile ? 30 : 20,
      },
    });
  }

  if (!currentQuiz) {
    return (
      <div className="w-full flex flex-col gap-2 items-center justify-center">
        <Loader />
        <b>Loading quiz.</b>
        <b>Please wait...</b>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl m-auto py-5 px-2 sm:px-4 flex flex-col gap-4">
      {resultProcess.status === "loading" ? (
        <div className="w-full flex flex-col gap-2 items-center justify-center">
          <Loader />
          <b>Processing your result.</b>
          <b>Please wait...</b>
        </div>
      ) : resultProcess.status === "processed" && resultProcess.result ? (
        <div className="w-full flex flex-col gap-3">
          <ResultComponent
            ref={targetRef}
            quiz={currentQuiz}
            attempt={resultProcess.result}
          />
          <div className="w-full flex gap-2 px-2 items-center justify-end">
            {role === "guest" ? (
              <Link href={`/auth/login`}>
                <Button
                  variant="secondary"
                  className="flex items-center justify-center gap-2"
                >
                  Save results
                </Button>
              </Link>
            ) : !saveResults ? (
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2"
                onClick={resaveResult}
              >
                <Save />
                Save result
              </Button>
            ) : null}
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={handlePDF}
            >
              <DownloadIcon />
              Download as pdf
            </Button>
          </div>
        </div>
      ) : null}

      {!quizTiming.started && (
        <>
          <GoBack to="/" />
          {currentQuiz && resultProcess.status === "not loaded" && (
            <Details startQuiz={handleStartQuiz} />
          )}
        </>
      )}

      <MinuteCountdown
        show={
          quizTiming.started &&
          !quizTiming.ended &&
          resultProcess.status === "not loaded"
        }
        setEnd={handleEnd}
        minutes={quizTiming.timeLeft}
      />
      <QuestionComponent
        setEnd={handleEnd}
        setResultProcess={setResultProcess}
        reSave={resave}
        show={
          quizTiming.started &&
          !quizTiming.ended &&
          resultProcess.status === "not loaded"
        }
      />
    </div>
  );
}
