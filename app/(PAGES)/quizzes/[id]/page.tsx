"use client";
import { MinuteCountdown } from "@/components/CountDown";
import GoBack from "@/components/GoBack";
import Details from "@/components/Quiz/Details";
import QuestionComponent from "@/components/Quiz/Question";
import { fetchQuizById } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { id } = useParams<{ id: string }>();
  const [quizTiming, setQuizTiming] = useState({
    started: false,
    timeLeft: 0,
    ended:false
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (id) {
      dispatch(fetchQuizById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentQuiz) {
      setQuizTiming((qt) => ({
        ...qt,
        timeLeft: currentQuiz.duration,
      }));
    }
  }, [currentQuiz]);

  function handleEnd(end:boolean) {
    setQuizTiming((qt) => ({
      ...qt,
      ended: end,
    }));
  }

  function handleStartQuiz() {
    setQuizTiming((qt) => ({
      ...qt,
      started: true,
    }));
  }

  return (
    <div className="w-full max-w-3xl m-auto py-5 px-2 sm:px-4 flex flex-col gap-4">
      {!quizTiming.started && (
        <>
          <GoBack to="/" />
          {
           currentQuiz&& <Details startQuiz={handleStartQuiz}/>
          }
        </>
      )}
     
      {quizTiming.started &&!quizTiming.ended && (
        <>
         <MinuteCountdown setEnd={handleEnd} minutes={quizTiming.timeLeft} />
        <QuestionComponent /></>
      )}
    </div>
  );
}
