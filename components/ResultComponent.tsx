import { Quiz, QuizAttempt } from "@/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
type Props = {
  result: QuizAttempt;
  quiz: Quiz;
  ref:React.Ref<HTMLDivElement>
};

export default function ResultComponent({ quiz, result,ref }: Props) {
  return (
        <div className="w-[1024px] px-2 absolute top-0 sm:max-w-5xl m-auto py-5 flex flex-col gap-4 isolate z-0">
      <div ref={ref} className="w-full px-5 max-w-full mx-auto">
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
              Score: {result.score} / {result.totalQuestions}
            </p>
            <p className="text-gray-500">
              Completion Time: {result.completionTime}
            </p>
            <p className="text-sm text-gray-400">
              Attempted on: {new Date(result.createdAt).toLocaleString()}
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
              {result.details.map((answer, index) => {
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
                    <TableCell
                      className={isCorrect ? "text-green-600" : "text-red-600"}
                    >
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
