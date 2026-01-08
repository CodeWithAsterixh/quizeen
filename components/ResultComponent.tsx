import Image from "next/image";
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
  pdfMode?: boolean;
  userName?: string;
  ref: React.Ref<HTMLDivElement>;
};

export default function ResultComponent({ quiz, attempt, ref, pdfMode, userName }: Readonly<Props>) {
  const attemptedOn = new Date(attempt.createdAt).toLocaleString();
  const correctCount = attempt.details.filter(
    (d) => d.userAnswer === d.correctAnswer
  ).length;

  const containerBase = "w-full m-auto flex items-stretch flex-col isolate z-0 relative bg-white text-neutral-800";
  const containerClass = `${containerBase} ${pdfMode ? "max-w-[800px] px-5 py-5" : "max-w-[900px] px-6 py-6"}`;

  return (
    <div ref={ref} className={containerClass}>
      {/* Decorative background, suppressed in pdfMode */}
      {!pdfMode && (
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50/80 via-white to-white" />
      )}

      {/* Header with Logo and user */}
      <div className={`${pdfMode ? "pb-2" : "pb-3"} w-full flex items-center gap-3 border-b`}>        
        <div className="shrink-0">
          {pdfMode ? (
            <Image src="/assets/icon.svg" alt="Company Logo" width={28} height={28} />
          ) : (
            <div className="relative h-8 w-8">
              <Image src="/assets/icon.svg" alt="Company Logo" fill sizes="32px" className="object-contain" />
            </div>
          )}
        </div>
        <div className="flex flex-col leading-tight">
          <span className={`${pdfMode ? "text-[10px] tracking-normal" : "text-[11px] tracking-[0.14em]"} uppercase text-neutral-500`}>Quiz Results</span>
          <h1 className={`${pdfMode ? "text-[18px]" : "text-[20px]"} font-semibold`}>{quiz.title}</h1>
        </div>
        {!pdfMode && (
          <div className="ml-auto text-right">
            <div className="text-[11px] text-neutral-500">Participant</div>
            <div className="text-sm font-medium text-neutral-800">{userName || "guest"}</div>
          </div>
        )}
        {pdfMode && (
          <div className="ml-auto text-right">
            <div className="text-[10px] text-neutral-500">Participant</div>
            <div className="text-[12px] font-medium text-neutral-800">{userName || "guest"}</div>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <Card className={`w-full ${pdfMode ? "p-3 border border-neutral-300 shadow-none rounded-none" : "p-4 border shadow-sm"}`}>
        <CardHeader className="p-0 mb-2">
          <CardTitle className={`${pdfMode ? "text-[14px]" : "text-base"} font-semibold`}>Summary</CardTitle>
        </CardHeader>
        <CardContent className={`${pdfMode ? "text-[12px] leading-5" : "text-[13px] leading-relaxed"} p-0 text-neutral-700 space-y-2`}>
          {quiz.description && <p className="leading-normal">{quiz.description}</p>}
          <div className="grid grid-cols-2 gap-y-1 pt-1">
            <p><span className="font-medium">Duration:</span> {quiz.duration} mins</p>
            <p className="text-right"><span className="font-medium">Attempted on:</span> {attemptedOn}</p>
            <p>
              <span className="font-medium">Score:</span> {attempt.score} / {attempt.totalQuestions}
              <span className={`${pdfMode ? "text-[9px]" : "text-[10px]"} ml-2 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 align-middle`}>
                {correctCount} correct
              </span>
            </p>
            <p className="text-right"><span className="font-medium">Completion Time:</span> {attempt.completionTime}</p>
          </div>
        </CardContent>
      </Card>

      {/* Questions Table */}
      <div className="w-full">
        <h2 className={`${pdfMode ? "text-[14px]" : "text-[15px]"} font-semibold mb-2`}>Questions & Answers</h2>
        {!pdfMode && (
          <div className="h-1 w-full mb-2 bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-400 rounded-full" />
        )}
        <Table className={`table-fixed border ${pdfMode ? "text-[12px]" : "text-[13px]"}`}>
          <TableHeader className="bg-neutral-50">
            <TableRow className="border-b">
              <TableHead className="w-[6%] whitespace-nowrap">#</TableHead>
              <TableHead className="w-[58%]">Question</TableHead>
              <TableHead className="w-[12%] whitespace-nowrap">Your Answer</TableHead>
              <TableHead className="w-[12%] whitespace-nowrap">Correct</TableHead>
              <TableHead className="w-[12%] whitespace-nowrap">Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attempt.details.map((answer, index) => {
              const question = quiz.questions.find((q) => q._id === answer.questionId);
              const isCorrect = answer.userAnswer === answer.correctAnswer;
              return (
                <TableRow key={answer.questionId} className="border-b align-top">
                  <TableCell className={`py-2`}>{index + 1}</TableCell>
                  <TableCell className="py-2 pr-3">
                    <p className="font-medium leading-snug line-clamp-2">{question ? question.text : "N/A"}</p>
                  </TableCell>
                  <TableCell className="py-2 whitespace-nowrap">
                    <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                      {answer.userAnswer}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 whitespace-nowrap">
                    <span>{answer.correctAnswer}</span>
                  </TableCell>
                  <TableCell className="py-2 whitespace-nowrap">
                    <span>{answer.timeTaken}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Footer note for PDF */}
      <p className={`${pdfMode ? "text-[9px]" : "text-[10px]"} text-neutral-400 pt-3 self-end`}>Generated by Quizeen</p>
    </div>
  );
}
