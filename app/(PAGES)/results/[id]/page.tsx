"use client";

import Loader from "@/components/loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppSelector } from "@/lib/hooks";
import { Quiz, QuizAttempt } from "@/types";
import api from "@/utils/api";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const user = useAppSelector(s=>s.auth.user);
  const [attempt, setAttempt] = useState<QuizAttempt>();
  const [quiz, setQuiz] = useState<Quiz>();

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
    } catch (err) {
      return;
    }
  }, [id]);

  useEffect(() => {
    findQuizResult();
  }, [findQuizResult]);

  if (!quiz || !attempt) {
    return <Loader />;
  }
  if(user?._id!==attempt.userId){
    return null
  }


  return (
    <div className="w-full px-2 sm:max-w-5xl m-auto py-5 flex flex-col gap-4 isolate z-0 relative">
      <div className="w-full mx-auto">
      <Card className="p-2 sm:p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{quiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {quiz.description && (
            <p className="text-gray-600">{quiz.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Duration: {quiz.duration} mins
          </p>
          <p className="mt-4 text-lg font-semibold">
            Score: {attempt.score} / {attempt.totalQuestions}
          </p>
          <p className="text-gray-500">Completion Time: {attempt.completionTime}</p>
          <p className="text-sm text-gray-400">
            Attempted on: {new Date(attempt.createdAt).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Question</TableHead>
              <TableHead>Your Answer</TableHead>
              <TableHead>Correct Answer</TableHead>
              <TableHead>Time Taken</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempt.details.map((answer, index) => {
              const question = quiz.questions.find(
                (q) => q._id === answer.questionId
              );
              const isCorrect = answer.userAnswer === answer.correctAnswer;
              return (
                <TableRow
                  key={answer.questionId}
                  className={isCorrect ? "bg-green-100" : "bg-red-100"}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{question ? question.text : "N/A"}</TableCell>
                  <TableCell className={isCorrect ? "text-green-600" : "text-red-600"}>
                    {answer.userAnswer}
                  </TableCell>
                  <TableCell>{answer.correctAnswer}</TableCell>
                  <TableCell>{answer.timeTaken}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

    </div>
    </div>
  );
}
