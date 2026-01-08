"use client";

import Loader from "@/components/loader";
import ResultComponent from "@/components/ResultComponent";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppSelector } from "@/lib/hooks";
import { Quiz, QuizAttempt } from "@/types";
import api from "@/utils/api";
import { DownloadIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePDF } from "react-to-pdf";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector((s) => s.auth.user);
  const [attempt, setAttempt] = useState<QuizAttempt>();
  const [quiz, setQuiz] = useState<Quiz>();
  const { targetRef, toPDF } = usePDF();
  const isMobile = useIsMobile();
  const [pdfMode, setPdfMode] = useState(false);

  const findQuizResult = useCallback(async () => {
    try {
      if (id) {
        const res = await api.get<QuizAttempt[]>(`/results?rid=${id}`);

        if (res.data) {
          const data = res.data[0];
          setAttempt(data);
          const qui = await api.get<Quiz>(`/quizzes/${data.quizId}`);
          setQuiz(qui.data);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch {
      return;
    }
  }, [id]);

  async function handlePDF() {
    // Enable PDF-safe styles for capture
    setPdfMode(true);
    try {
      toPDF({
        canvas: {
          mimeType: "image/jpeg",
          qualityRatio: 0.85,
        },
        filename: `${quiz?.title}-result.pdf`,
        resolution: isMobile ? 2.5 : 3,
        method: "save",
        page: {
          format: "letter",
          margin: isMobile ? 20 : 14,
          orientation: "portrait",
        },
      });
    } finally {
      // Revert PDF-safe styles after capture
      setPdfMode(false);
    }
  }

  useEffect(() => {
    findQuizResult();
  }, [findQuizResult]);

  if (!quiz || !attempt) {
    return <Loader />;
  }
  if (user?._id !== attempt.userId) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-2 py-2">
      <ResultComponent ref={targetRef} userName={user.fullName} attempt={attempt} quiz={quiz} pdfMode={pdfMode} />

      <div className="w-full flex gap-2 px-2 items-center justify-end">
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
  );
}
