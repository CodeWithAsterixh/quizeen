"use client";
import Loader from "@/components/loader";
import QuizForm from "@/components/QuizForm";
import { useAppSelector } from "@/lib/hooks";
import { BookXIcon } from "lucide-react";
import { useParams } from "next/navigation";

export default function Edit() {
  const { currentQuiz, loading, error } = useAppSelector((s) => s.quiz);
  const { id } = useParams<{ id: string }>();

  if (loading) {
    return (
      <div className="w-full py-10 flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!currentQuiz || error) {
    return (
      <div className="w-full py-10 flex flex-col items-center justify-center">
        <BookXIcon className="size-20 text-neutral-300" />
        <p>Quiz not found</p>
        {error && <p>{error}</p>}
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-2 sm:px-4">
      <QuizForm
        dataFiller={{
          description: `${currentQuiz.description}`,
          duration: currentQuiz.duration,
          questions: currentQuiz.questions,
          title: currentQuiz.title,
          _id: id,
        }}
        type="EDIT"
      />
    </div>
  );
}
