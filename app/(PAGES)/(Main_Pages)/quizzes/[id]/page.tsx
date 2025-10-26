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
import { authInterceptorNext } from "@/utils/authInterceptorNext";
import { DownloadIcon, Save } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { usePDF } from "react-to-pdf";

export default function Page() {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { role, user } = useAppSelector((s) => s.auth);
  const { saveResults } = useAppSelector((s) => s.settings);
  const isMobile = useIsMobile();
  const { handleToggleSaveResults } = useSettingsUpdate().actions;

  const { targetRef, toPDF } = usePDF();
  const [quizTiming, setQuizTiming] = useState({
    started: false,
    timeLeft: 0,
    ended: false,
  });
  const progressSaveInterval = useRef<number | null>(null);
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

  // Helper to manage localStorage ongoing quizzes
  const ONGOING_KEY = "ongoingQuizzes";

  const readOngoing = () => {
    try {
      const raw = localStorage.getItem(ONGOING_KEY);
      if (!raw) return [] as any[];
      return JSON.parse(raw) as any[];
    } catch (e) {
      return [] as any[];
    }
  };

  const writeOngoing = (arr: any[]) => {
    try {
      localStorage.setItem(ONGOING_KEY, JSON.stringify(arr));
    } catch (e) {
      // ignore
    }
  };

  // Sync ongoing progress to server for authenticated users
  const syncProgressToServer = async (entry: any) => {
    if (!entry) return;
    try {
      // Use navigator.sendBeacon when available to avoid blocking unload
      const url = `/api/quizzes/${entry.quizId}/progress`;
      const payload = JSON.stringify(entry);
      if (navigator && (navigator as any).sendBeacon) {
        (navigator as any).sendBeacon(url, payload);
      } else {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          credentials: "include",
        });
      }
    } catch (err) {
      // best-effort sync
      console.error("progress sync failed", err);
    }
  };

  const handleEnd = useCallback(
    (end: boolean, answers: Record<number, selectedOptions>) => {
      setQuizTiming((qt) => ({
        ...qt,
        ended: end,
      }));

      // remove from localStorage as it's completed
      try {
        const arr = readOngoing();
        const filtered = arr.filter((a) => a.quizId !== currentQuiz?._id);
        writeOngoing(filtered);
      } catch (e) {
        // ignore
      }

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
    const startedAt = new Date().toISOString();
    // persist to localStorage
    try {
      const arr = readOngoing();
      const existingIdx = arr.findIndex((a) => a.quizId === currentQuiz?._id);
      const entry = {
        quizId: currentQuiz?._id,
        startedAt,
        duration: currentQuiz?.duration,
        role: role || "guest",
        userId: user?._id,
      } as any;
      if (existingIdx >= 0) {
        arr[existingIdx] = entry;
      } else {
        arr.push(entry);
      }
      writeOngoing(arr);
    } catch (e) {
      // ignore
    }

    setQuizTiming((qt) => ({
      ...qt,
      started: true,
    }));

    // For authenticated users, trigger a background sync and periodic saves
    if (role && role !== "guest") {
      try {
        const arr = readOngoing();
        const entry = arr.find((a) => a.quizId === currentQuiz?._id);
        if (entry) syncProgressToServer(entry);
        // periodic save every 30s
        if (progressSaveInterval.current == null) {
          progressSaveInterval.current = window.setInterval(() => {
            const a = readOngoing().find((x) => x.quizId === currentQuiz?._id);
            if (a) syncProgressToServer(a);
          }, 30000) as unknown as number;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // On mount, check localStorage for ongoing quiz and resume timer if present
  useEffect(() => {
    if (!currentQuiz) return;
    try {
      const arr = readOngoing();
      const entry = arr.find((a) => a.quizId === currentQuiz._id);
      if (entry) {
        const started = new Date(entry.startedAt).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - started) / 1000);
        const total = (currentQuiz.duration || 0) * 60;
        const remaining = total - elapsed;
        if (remaining <= 0) {
          // time's up — end quiz
          handleEnd(true, {});
        } else {
          setQuizTiming((qt) => ({
            ...qt,
            started: true,
            timeLeft: Math.ceil(remaining / 60),
          }));

          // Attempt an immediate sync for authenticated users
          if (role && role !== "guest") {
            // ensure we attach the current user id if available and try to fetch server progress
            syncProgressToServer({ ...entry, userId: user?._id });
            // try to fetch any saved server progress and merge answers into localStorage so QuestionComponent can pick it up
            (async () => {
              try {
                const res = await fetch(`/api/quizzes/${currentQuiz._id}/progress`, { credentials: 'include' });
                if (res.ok) {
                  const data = await res.json();
                  if (data && data.progress && data.progress.answers) {
                    const serverAnswers = data.progress.answers;
                    // merge into local storage entry (server wins)
                    const a = readOngoing();
                    const idx = a.findIndex((x) => x.quizId === currentQuiz._id);
                    if (idx >= 0) {
                      a[idx].answers = serverAnswers;
                      a[idx].lastSavedAt = new Date().toISOString();
                      writeOngoing(a);
                    } else {
                      a.push({ quizId: currentQuiz._id, startedAt: entry.startedAt, duration: currentQuiz.duration, role: role, userId: user?._id, answers: serverAnswers, lastSavedAt: new Date().toISOString() });
                      writeOngoing(a);
                    }
                    try {
                      // notify other components (e.g., QuestionComponent) that progress was updated
                      window.dispatchEvent(new CustomEvent('ongoingProgressUpdated', { detail: { quizId: currentQuiz._id } }));
                    } catch (e) {
                      // ignore
                    }
                  }
                }
              } catch (e) {
                // ignore
              }
            })();
            if (progressSaveInterval.current == null) {
              progressSaveInterval.current = window.setInterval(() => {
                const a = readOngoing().find((x) => x.quizId === currentQuiz._id);
                if (a) syncProgressToServer(a);
              }, 30000) as unknown as number;
            }
          }
        }
      }
    } catch (e) {
      // ignore
    }

    // Add beforeunload handler to sync last state
    const handleBeforeUnload = () => {
      try {
        const a = readOngoing().find((x) => x.quizId === currentQuiz._id);
        if (a) {
          syncProgressToServer({ ...a, userId: user?._id });
        }
      } catch (e) {
        // ignore
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (progressSaveInterval.current != null) {
        clearInterval(progressSaveInterval.current as any);
        progressSaveInterval.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuiz]);
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
  const next = JSON.stringify(authInterceptorNext({url:`/quizzes/${currentQuiz._id}`, action:'quiz-submit'}))
  

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
              <Link href={`/auth/login?_next=${next}`}>
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
