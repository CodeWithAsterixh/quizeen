import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectedOptions } from "@/types";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const QuestionComponent = () => {
  const {toast} = useToast()

  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const {loading} = useAppSelector((s) => s.quiz);
  const user = useAppSelector((s) => s.auth.user);
  
  const [quizState, setQuizState] = useState({
    current: 0,
    status: "not-finished" as "not-finished" | "finished",
  });
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
        answers
      })
    );

    if(res.meta.requestStatus === "rejected"){
      toast({
        variant:"destructive",
        description:"Your answers was not submitted successfully"
      })
    }else{
      toast({
        variant:"success",
        description:"Your answers was submitted, check your result page for results"
      })
      setTimeout(() => {
        push(`/results`)
      }, 1000);
    }
    


  }, [answers, currentQuiz?._id, dispatch, push, user?._id]);

  

  if (!currentQuiz) {
    return "loading";
  }
  return (
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
  );
};

export default QuestionComponent;
