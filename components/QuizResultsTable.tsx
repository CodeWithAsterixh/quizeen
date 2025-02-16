import { Quiz, QuizAttempt } from "@/types";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { LoaderIcon } from "react-hot-toast";
import UseModal from "./Modal";
import QuizAttemptDetails from "./QuizAttemptsDetails";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface QuizResultsTableProps {
  results: QuizAttempt[];
}

export default function QuizResultsTable({ results }: QuizResultsTableProps) {
  const [quiz, setQuiz] = useState<Quiz[]>([]);

  const getQuizzes = async (id: string) => {
    const res = await api.get(`/quizzes/${id}`);

    return res.data;
  };
  useEffect(() => {
    results.map((result) => {
      getQuizzes(result.quizId).then((quizRes: Quiz) => {
        setQuiz((q) => [...q, quizRes]);
      });
    });
  }, [results]);

  return (
    <div className="overflow-x-auto scrollbar">
      <table className="min-w-full border-collapse border border-gray-200">
        <TableHeader className="bg-gray-100">
          <TableRow>
            <TableHead className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-700">
              Quiz Title
            </TableHead>
            <TableHead className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-700">
              Score
            </TableHead>
            <TableHead className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-700">
              Total Questions
            </TableHead>
            <TableHead className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-700">
              Completion Time
            </TableHead>
            <TableHead className="px-4 py-2 border border-gray-200 text-left text-sm font-medium text-gray-700">
              Created At
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, ind) => (
            <UseModal
              key={ind}
              trigger={
                <TableRow key={result._id} className="hover:bg-gray-50 cursor-pointer">
                  <TableCell className="px-4 py-2 border border-gray-200 text-sm">
                    {quiz.length > 0 && quiz[ind]?.title ? (
                      quiz[ind].title
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <LoaderIcon className="animate-spin"></LoaderIcon>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-2 border border-gray-200 text-sm">
                    {result.score}
                  </TableCell>
                  <TableCell className="px-4 py-2 border border-gray-200 text-sm">
                    {result.totalQuestions}
                  </TableCell>
                  <TableCell className="px-4 py-2 border border-gray-200 text-sm">
                    {result.completionTime}
                  </TableCell>
                  <TableCell className="px-4 py-2 border border-gray-200 text-sm">
                    {new Date(result.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              }
              contentHeader={{
                title: "Quiz Details",
              }}
              others={<QuizAttemptDetails quiz={quiz[ind]} attempt={result} />}
            />
          ))}

          {results.length === 0 && (
            <tr>
              <TableCell
                colSpan={6}
                className="px-4 py-2 border border-gray-200 text-center text-sm text-gray-500"
              >
                No quiz results available.
              </TableCell>
            </tr>
          )}
        </TableBody>
      </table>
    </div>
  );
}
