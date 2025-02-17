import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { QuizAttempt, selectedOptions } from "@/types";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import UseModal from "../Modal";
// import ResultComponent from "../ResultComponent";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ToastAction } from "../ui/toast";
// import { Margin, usePDF } from "react-to-pdf";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const QuestionComponent = () => {
  const {toast} = useToast()
  // const { toPDF, targetRef } = usePDF();

  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const {loading} = useAppSelector((s) => s.quiz);
  const {user,role} = useAppSelector((s) => s.auth);
  
  const [quizState, setQuizState] = useState({
    current: 0,
    status: "not-finished" as "not-finished" | "finished",
  });
  const [resultOpen, setResultOpen] = useState(false)
  const [resultDetail, setResultDetail] = useState<QuizAttempt>()
  const dispatch = useAppDispatch();
  const [answers, setAnswers] = useState<Record<number, selectedOptions>>({});
  const {push} = useRouter()
  const handleNext = useCallback(() => {
    if (currentQuiz) {
      if (quizState.current === currentQuiz.questions.length - 1) {
        setQuizState((st) => ({
          ...st,
          status: "finished",
        }));
      } else {
        setQuizState((st) => ({
          current: st.current + 1,
          status: "not-finished",
        }));
      }
    }
  }, [currentQuiz, quizState]);
  const handlePrev = useCallback(() => {
    if (currentQuiz) {
      if (quizState.current !== 0) {
        setQuizState((st) => ({
          current: st.current - 1,
          status: "not-finished",
        }));
      }
    }
  }, [currentQuiz, quizState]);
  const handleSubmit = useCallback(async() => {
   const res = await dispatch(
      submitQuiz({
        quizId: currentQuiz?._id||"",
        userId: user?._id||"",
        answers,
        role
      })
    );

    if(res.meta.requestStatus === "rejected"){
      toast({
        variant:"destructive",
        description:"Your answers was not submitted successfully"
      })
    }else{
      
      if(role!=="guest"){
        toast({
          variant:"success",
          description:"Your answers was submitted, check your result page for results"
        })
        setTimeout(() => {
          push(`/results`)
        }, 1000);
      }else{
        toast({
          variant:"default",
          description:"Your submitted as a guest",
          duration:100000,
          action:<ToastAction altText="Show Result" onClick={()=>setResultOpen(true)}>Show Result</ToastAction>,
          
        })
        setResultDetail(res.payload as QuizAttempt)
      }
    }
    


  }, [answers, currentQuiz?._id, dispatch, push, role, toast, user?._id]);

  

  

  if (!currentQuiz) {
    return "loading";
  }
  return (
    <>
    {
      resultDetail&&resultOpen&&<UseModal contentHeader={{
        title:"Your results"
      }} open={resultOpen} onClose={()=>setResultOpen(false)} others={
        <>
        <div className="w-full px-2 sm:max-w-5xl m-auto py-5 flex flex-col gap-4 isolate z-0 relative">
      <div className="w-full mx-auto">
      <Card className="p-2 sm:p-6 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{currentQuiz.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentQuiz.description && (
            <p className="text-gray-600">{currentQuiz.description}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            Duration: {currentQuiz.duration} mins
          </p>
          <p className="mt-4 text-lg font-semibold">
            Score: {resultDetail.score} / {resultDetail.totalQuestions}
          </p>
          <p className="text-gray-500">Completion Time: {resultDetail.completionTime}</p>
          <p className="text-sm text-gray-400">
            Attempted on: {new Date(resultDetail.createdAt).toLocaleString()}
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
            {resultDetail.details.map((answer, index) => {
              const question = currentQuiz.questions.find(
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
      {/* <div className="w-full flex items-center justify-end">
          <Button onClick={() => toPDF({
            page:{
                format:"letter",
                margin: Margin.LARGE
            }
          })}>
            <DownloadIcon />
            Download
          </Button>
        </div> */}
    </div>
    </div>
        {/* <ResultComponent ref={targetRef} quiz={currentQuiz} result={resultDetail}/> */}
        </>
      } />
    }
    <Card className="w-full bg-neutral-200 p-2 sm:p-5">
      <CardHeader className="p-2 sm:p-6">
        <CardTitle className="text-xl font-semibold">
          {quizState.current + 1}.{" "}
          {currentQuiz.questions[quizState.current].text}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <RadioGroup
          className="grid grid-cols-1 sm:grid-cols-2"
          value={answers[quizState.current + 1]}
        >
          {Object.entries(currentQuiz.questions[quizState.current].options).map(
            ([key, value]) => (
              <div
                key={key}
                className={clsx(
                  "flex items-center space-x-2 cursor-pointer bg-neutral-100 p-4 rounded-md duration-300",
                  answers[quizState.current + 1] === key &&
                    "bg-neutral-600 text-white !cursor-default"
                )}
                onClick={() => {
                  // Use the same index for checking and updating
                  if (
                    !answers[quizState.current + 1] ||
                    answers[quizState.current + 1] !== key
                  ) {
                    setAnswers((ans) => ({
                      ...ans,
                      [quizState.current + 1]: key as selectedOptions,
                    }));
                  }
                }}
              >
                <RadioGroupItem
                  value={key}
                  id={key}
                  className={clsx(
                    "duration-300",
                    answers[quizState.current + 1] === key &&
                      "bg-white border-white outline-none"
                  )}
                />
                <Label htmlFor={key} className="break-all">{value as string}</Label>
              </div>
            )
          )}
        </RadioGroup>

        <div
          className={clsx(
            "w-full flex items-center gap-2 py-4",
            quizState.current !== 0 &&
              quizState.current !== currentQuiz.questions.length - 1
              ? "justify-between"
              : "justify-end"
          )}
        >
          {quizState.current !== 0 && (
            <Button
              variant={
                quizState.status === "not-finished" &&
                quizState.current !== currentQuiz.questions.length - 1
                  ? "default"
                  : "outline"
              }
              onClick={handlePrev}
            >
              Previous
            </Button>
          )}
          {quizState.status === "not-finished" &&
          quizState.current !== currentQuiz.questions.length - 1 ? (
            <>
              <Button
                disabled={!answers[quizState.current + 1]}
                onClick={handleNext}
              >
                Next
              </Button>
            </>
          ) : (
            <Button
              disabled={!answers[quizState.current + 1]}
              onClick={handleSubmit}
            >
              Submit {
                loading&&<Loader2 className="animate-spin"/>
              }
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
};

export default QuestionComponent;
