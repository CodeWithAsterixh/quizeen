"use client";
import { MinuteCountdown } from "@/components/CountDown";
import GoBack from "@/components/GoBack";
import Loader from "@/components/loader";
import Details from "@/components/Quiz/Details";
import QuestionComponent from "@/components/Quiz/Question";
import ResultComponent from "@/components/ResultComponent";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useQuizResult } from "@/hooks/useQuizResult";
import { useQuizTiming } from "@/hooks/useQuizTiming";
import { useSettingsUpdate } from "@/hooks/useSettingsUpdate";
import { useAppSelector } from "@/lib/hooks";
import { authInterceptorNext } from "@/utils/authInterceptorNext";
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
  const { quizTiming, startQuiz, endQuiz, setTimeLeft } = useQuizTiming();
  const { startQuizProgress, resumeQuizProgress, endQuizProgress } =
    useQuizProgress();
  const { resultProcess, handleEnd, updateResultProcess } = useQuizResult();
  const [resave, setResave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resaveResult() {
    handleToggleSaveResults();
    setResave(true);
  }

  function handleStartQuiz() {
    try {
      startQuizProgress();
      startQuiz();
    } catch {
      setError("Failed to start quiz. Please try again.");
    }
  }

  const resumeEffect = useCallback(() => {
    if (!currentQuiz) return;
    const resume = resumeQuizProgress();
    if (resume) {
      if (resume.ended) {
        handleEnd(true, {});
      } else {
        startQuiz();
        setTimeLeft(resume.timeLeft);
      }
    }
  }, [currentQuiz]);

  useEffect(() => {
    resumeEffect();
  }, [resumeEffect]);
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
        {error && <p className="text-red-500">{error}</p>}
      </div>
    );
  }
  const next = JSON.stringify(
    authInterceptorNext({
      url: `/quizzes/${currentQuiz._id}`,
      action: "quiz-submit",
    })
  );
  const shouldSaveResult = saveResults ? null : (
    <Button
      variant="secondary"
      className="flex items-center justify-center gap-2"
      onClick={resaveResult}
    >
      <Save />
      Save result
    </Button>
  );
  const resultAvailable =
    resultProcess.status === "processed" && resultProcess.result ? (
      <div className="w-full flex flex-col gap-3">
        <ResultComponent
          ref={targetRef}
          quiz={currentQuiz}
          attempt={resultProcess.result}
        />
        <div className="w-full flex gap-2 px-2 items-center justify-end">
          {role === "guest" ? (
            <Link href={`/auth/login?_next=${next}`}>
              <Button
                variant="secondary"
                className="flex items-center justify-center gap-2"
              >
                Save results
              </Button>
            </Link>
          ) : (
            shouldSaveResult
          )}
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
    ) : null;

  return (
    <div className="w-full max-w-3xl m-auto py-5 px-2 sm:px-4 flex flex-col gap-4">
      {error && (
        <div className="w-full p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)} className="mt-2 underline">
            Dismiss
          </button>
        </div>
      )}
      {resultProcess.status === "loading" ? (
        <div className="w-full flex flex-col gap-2 items-center justify-center">
          <Loader />
          <b>Processing your result.</b>
          <b>Please wait...</b>
        </div>
      ) : (
        resultAvailable
      )}

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
        setEnd={(end, answers) => {
          handleEnd(end, answers);
          endQuizProgress(answers);
          endQuiz(end);
        }}
        setResultProcess={updateResultProcess}
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
