import { Quiz, QuizAttempt } from "@/types";
import api from "@/utils/api";
import { useEffect, useState } from "react";
import { LoaderIcon } from "react-hot-toast";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { useRouter } from "next/navigation";

interface QuizResultsTableProps {
  results: QuizAttempt[];
}

export default function QuizResultsTable({ results }: QuizResultsTableProps) {
  const [quiz, setQuiz] = useState<Quiz[]>([]);
  const { push } = useRouter();

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

  function handleRoute(id: string) {
    push(`/results/${id}`);
  }

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
          {results.map((result) => {
            const quizName = quiz.find(res => res._id === result.quizId)?.title
            return (
              <TableRow
                key={result._id}
                onClick={()=>handleRoute(result._id)}
                className="hover:bg-gray-50 cursor-pointer"
              >
                <TableCell className="px-4 py-2 border border-gray-200 text-sm">
                  {quiz.length > 0 &&  quizName? (
                    quizName
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
            )
          })}

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
