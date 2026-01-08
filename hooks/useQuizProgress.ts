/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { selectedOptions } from '@/types';

interface OngoingEntry {
  quizId: string;
  startedAt: string;
  duration?: number;
  role?: string;
  userId?: string;
  answers?: Record<number, selectedOptions>;
  lastSavedAt?: string;
}

export const useQuizProgress = () => {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { role, user } = useAppSelector((s) => s.auth);
  const progressSaveInterval = useRef<number | null>(null);

  const ONGOING_KEY = "ongoingQuizzes";

  const readOngoing = useCallback((): OngoingEntry[] => {
    try {
      const raw = localStorage.getItem(ONGOING_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Error reading ongoing quizzes:", error);
      return [];
    }
  }, []);

  const writeOngoing = useCallback((arr: OngoingEntry[]) => {
    try {
      localStorage.setItem(ONGOING_KEY, JSON.stringify(arr));
    } catch (error) {
      console.error("Error writing ongoing quizzes:", error);
    }
  }, []);

  const syncProgressToServer = useCallback(async (entry: OngoingEntry) => {
    if (!entry) return;
    try {
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
    } catch (error) {
      console.error("Progress sync failed:", error);
    }
  }, []);

  const startQuizProgress = useCallback(() => {
    if (!currentQuiz) return;
    const startedAt = new Date().toISOString();
    const arr = readOngoing();
    const existingIdx = arr.findIndex((a) => a.quizId === currentQuiz._id);
    const entry: OngoingEntry = {
      quizId: currentQuiz._id,
      startedAt,
      duration: currentQuiz.duration,
      role: role || "guest",
      userId: user?._id,
    };
    if (existingIdx >= 0) {
      arr[existingIdx] = entry;
    } else {
      arr.push(entry);
    }
    writeOngoing(arr);

    // For authenticated users, start periodic sync
    if (role && role !== "guest") {
      const entry = arr.find((a) => a.quizId === currentQuiz._id);
      if (entry) syncProgressToServer(entry);
      if (progressSaveInterval.current == null) {
        progressSaveInterval.current = globalThis.window.setInterval(() => {
          const a = readOngoing().find((x) => x.quizId === currentQuiz._id);
          if (a) syncProgressToServer(a);
        }, 30000) as unknown as number;
      }
    }
  }, [currentQuiz, role, user, readOngoing, writeOngoing, syncProgressToServer]);

  const resumeQuizProgress = useCallback(() => {
    if (!currentQuiz) return;
    const arr = readOngoing();
    const entry = arr.find((a) => a.quizId === currentQuiz._id);
    if (entry) {
      const started = new Date(entry.startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - started) / 1000);
      const total = (currentQuiz.duration || 0) * 60;
      const remaining = total - elapsed;
      if (remaining <= 0) {
        // Time's up
        return { ended: true, timeLeft: 0 };
      } else {
        // For authenticated users, fetch server progress
        if (role && role !== "guest") {
          (async () => {
            try {
              const res = await fetch(`/api/quizzes/${currentQuiz._id}/progress`, { credentials: 'include' });
              if (res.ok) {
                const data = await res.json();
                if (data && data.progress && data.progress.answers) {
                  const serverAnswers = data.progress.answers;
                  const a = readOngoing();
                  const idx = a.findIndex((x) => x.quizId === currentQuiz._id);
                  if (idx >= 0) {
                    a[idx].answers = serverAnswers;
                    a[idx].lastSavedAt = new Date().toISOString();
                    writeOngoing(a);
                  } else {
                    a.push({ ...entry, answers: serverAnswers, lastSavedAt: new Date().toISOString() });
                    writeOngoing(a);
                  }
                  globalThis.window.dispatchEvent(new CustomEvent('ongoingProgressUpdated', { detail: { quizId: currentQuiz._id } }));
                }
              }
            } catch (error) {
              console.error("Error fetching server progress:", error);
            }
          })();
          if (progressSaveInterval.current == null) {
            progressSaveInterval.current = globalThis.window.setInterval(() => {
              const a = readOngoing().find((x) => x.quizId === currentQuiz._id);
              if (a) syncProgressToServer(a);
            }, 30000) as unknown as number;
          }
        }
        return { ended: false, timeLeft: Math.ceil(remaining / 60) };
      }
    }
    return null;
  }, [currentQuiz, role, user, readOngoing, writeOngoing, syncProgressToServer]);

  const endQuizProgress = useCallback((answers: Record<number, selectedOptions>) => {
    if (!currentQuiz) return;
    const arr = readOngoing();
    const filtered = arr.filter((a) => a.quizId !== currentQuiz._id);
    writeOngoing(filtered);
    // Sync final state
    const entry = arr.find((a) => a.quizId === currentQuiz._id);
    if (entry) {
      syncProgressToServer({ ...entry, answers });
    }
  }, [currentQuiz, readOngoing, writeOngoing, syncProgressToServer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const a = readOngoing().find((x) => x.quizId === currentQuiz?._id);
      if (a) {
        syncProgressToServer({ ...a, userId: user?._id });
      }
    };
    globalThis.window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      globalThis.window.removeEventListener("beforeunload", handleBeforeUnload);
      if (progressSaveInterval.current != null) {
        clearInterval(progressSaveInterval.current as any);
        progressSaveInterval.current = null;
      }
    };
  }, [currentQuiz, user, readOngoing, syncProgressToServer]);

  return useMemo(() => ({
    startQuizProgress,
    resumeQuizProgress,
    endQuizProgress,
    readOngoing,
    writeOngoing,
  }), [startQuizProgress, resumeQuizProgress, endQuizProgress, readOngoing, writeOngoing]);
};