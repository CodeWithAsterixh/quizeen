import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { QuizAttempt, selectedOptions } from "@/types";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
// import ResultComponent from "../ResultComponent";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ToastAction } from "@radix-ui/react-toast";
import { useRouter } from "next/navigation";
// import { Margin, usePDF } from "react-to-pdf";


type prop = {
  setEnd?: (end: boolean, answers:Record<number, selectedOptions>) => void;
  setResultProcess:(rep:{
    result?: QuizAttempt;
    status: "loading" | "processed" | "not loaded";
    answers:Record<number, selectedOptions>
})=>void
};

const QuestionComponent = ({ setEnd,setResultProcess }: prop) => {
  const { toast } = useToast();
  // const { toPDF, targetRef } = usePDF();

  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { loading } = useAppSelector((s) => s.quiz);
  const { user, role } = useAppSelector((s) => s.auth);

  const [quizState, setQuizState] = useState({
    current: 0,
    status: "not-finished" as "not-finished" | "finished" | "submitted",
  });
  const {push} = useRouter()

  const dispatch = useAppDispatch();
  const [answers, setAnswers] = useState<Record<number, selectedOptions>>({});
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
  const handleSubmit = useCallback(async () => {
    // set submit state
    setQuizState((st) => ({
      ...st,
      status: "submitted",
    }));
    if( setEnd){
      setEnd(true, answers)
    }

    setResultProcess({
      status:"loading",
      answers
     });
    const res = await dispatch(
      submitQuiz({
        quizId: currentQuiz?._id || "",
        userId: user?._id || "",
        answers,
        role,
      })
    );
    
    
    // verify result response

    if (res.meta.requestStatus === "rejected") {
      // feedbacl user for error
      toast({
        variant: "destructive",
        description: "Your answers was not submitted successfully",
      });
      setResultProcess({
        status:"not loaded",
        answers
       });
    } else {
      // feedback user success
      
      
      if(role === "guest"){
        toast({
          variant: "success",
          description:
            "Here is your result",
            action:<ToastAction altText="login" onClick={()=>push("/auth/login")}>Save now</ToastAction>
        });
      }else{
        toast({
          title: "Here is your result",
          variant:"success"
        })
      }
      setResultProcess({
        status:"processed",
        result: res.payload as QuizAttempt,
        answers
       });
    }
  }, [answers, currentQuiz?._id, dispatch, push, role, setEnd, setResultProcess, toast, user?._id]);


  
  if (!currentQuiz) {
    return "loading";
  }
  return (
    <>

      {quizState.status !== "submitted" && (
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
              {Object.entries(
                currentQuiz.questions[quizState.current].options
              ).map(([key, value]) => (
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
                  <Label htmlFor={key} className="break-all">
                    {value as string}
                  </Label>
                </div>
              ))}
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
                  Submit {loading && <Loader2 className="animate-spin" />}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default QuestionComponent;
