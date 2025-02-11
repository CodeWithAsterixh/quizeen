import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/lib/hooks";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import clsx from "clsx";
import { selectedOptions } from "@/types";

const QuestionComponent = () => {
    const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
    const [quizState, setQuizState] = useState({
        current: 0,
        status: "not-finished" as "not-finished"|"finished"
    })
    const [answers, setAnswers] = useState<Record<number, selectedOptions>>({
    });

    const handleNext = useCallback(
      () => {
        if(currentQuiz){
            if(quizState.current===currentQuiz.questions.length-1){
                setQuizState(st => ({
                    ...st,
                    status: "finished"
                }))
            }else{
                setQuizState(st => ({
                    current: st.current + 1,
                    status: "not-finished"

                }))
            }
        }
      },
      [currentQuiz, quizState],
    )
    const handlePrev = useCallback(
        () => {
          if(currentQuiz){
              if(quizState.current!==0){
                setQuizState(st => ({
                    current: st.current - 1,
                    status: "not-finished"

                }))
              }
          }
        },
        [currentQuiz, quizState],
      )

      useEffect(() => {
        console.log(quizState.current)
      }, [quizState])
      
    
    if(!currentQuiz){
        return("loading")
    }
    return(
        <Card className="w-full bg-neutral-200 p-5">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{quizState.current+1}. {currentQuiz.questions[quizState.current].text}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup className="grid grid-cols-2" value={answers[quizState.current+1]}>
            {Object.entries(currentQuiz.questions[quizState.current].options).map(([key, value]) => (
              <div key={key} className={
                clsx(
                    "flex items-center space-x-2 cursor-pointer bg-neutral-100 p-4 rounded-md duration-300",
                    answers[quizState.current+1] === key && "bg-neutral-600 text-white !cursor-default"
                )
              } onClick={()=>{
                if(!answers[quizState.current] || answers[quizState.current] !== key){
                    setAnswers(ans=>({
                        ...ans,
                        [quizState.current+1]:key as selectedOptions
                    }))
                }
              }}>
                <RadioGroupItem value={key} id={key} className={
                    clsx("duration-300",answers[quizState.current+1] === key && "bg-white border-white outline-none")
                } />
                <Label htmlFor={key}>{value as string}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className={
            clsx(
                "w-full flex items-center gap-2 py-4",
                quizState.current !==0 && quizState.current !== currentQuiz.questions.length-1?"justify-between":"justify-end"
            )
          }>
            {quizState.current !==0 &&<Button variant={quizState.status==="not-finished"&& quizState.current!==currentQuiz.questions.length-1?"default":"outline"} onClick={handlePrev}>Previous</Button>}
          {
            
            quizState.status === "not-finished"  && quizState.current!==currentQuiz.questions.length-1? (<>
            <Button onClick={handleNext}>Next</Button>
            </>):<Button>Submit</Button>
          }
          </div>
        </CardContent>
      </Card>
)
}
    
     ;

export default QuestionComponent;
