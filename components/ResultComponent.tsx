import { Quiz, QuizAttempt } from "@/types";
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
  attempt: QuizAttempt;
  quiz: Quiz;
  ref: React.Ref<HTMLDivElement>;
};

export default function ResultComponent({ quiz, attempt, ref }: Props) {
  return (
    <div
      ref={ref}
      className="w-full px-2 sm:max-w-5xl m-auto py-5 flex items-center flex-col gap-4 isolate z-0 relative"
    >
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
            <p className="text-gray-500">
              Completion Time: {attempt.completionTime}
            </p>
            <p className="text-sm text-gray-400">
              Attempted on: {new Date(attempt.createdAt).toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Table className="table-fixed">
            <TableHeader className="h-14 sm:h-fit">
              <TableRow>
                <TableHead className="w-6 sm:w-12 whitespace-nowrap">#</TableHead>
                <TableHead className="w-[50%]">Question</TableHead>
                <TableHead className="w-12 sm:w-24 sm:whitespace-nowrap">
                  Your Answer
                </TableHead>
                <TableHead className="w-12 sm:w-24 sm:whitespace-nowrap flex-shrink-0">
                  Correct Answer
                </TableHead>
                <TableHead className="w-12 sm:w-24 sm:whitespace-nowrap flex-shrink-0">
                  Time Taken
                </TableHead>
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
                    <TableCell className="w-8">{index + 1}</TableCell>
                    <TableCell className="w-1/3">
                      {question ? question.text : "N/A"}
                    </TableCell>
                    <TableCell className="w-1/3">
                      <span
                        className={
                          isCorrect ? "text-green-600" : "text-red-600"
                        }
                      >
                        {answer.userAnswer}
                      </span>
                    </TableCell>
                    <TableCell className="w-1/6 flex-shrink-0">
                      {answer.correctAnswer}
                    </TableCell>
                    <TableCell className="w-1/6 flex-shrink-0">
                      {answer.timeTaken}
                    </TableCell>
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
