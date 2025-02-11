import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Quiz, QuizAttempt } from "@/types";
import { DialogClose } from "./ui/dialog";

interface QuizAttemptDetailsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
}

const QuizAttemptDetails: React.FC<QuizAttemptDetailsProps> = ({ quiz, attempt }) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6 shadow-md">
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

      <div className="mt-6 flex justify-end">
        <DialogClose asChild>
        <Button>
          Back
        </Button>
        </DialogClose>
      </div>
    </div>
  );
};

export default QuizAttemptDetails;
