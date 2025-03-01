"use client"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CreateQuiz, fetchQuizById, UpdateQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Question } from "@/types";
import { PencilLine, Plus, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import UseModal from "./Modal";
import QuestionModal from "./QuestionModal";
import { DialogClose } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";

export interface QuizFormState {
  title: string,
    description: string,
    duration: number,
    questions: Question[],
    _id?:string
}

type props = {
  dataFiller?:QuizFormState,
  type?:"ADD"|"EDIT"
}
export default function QuizForm({dataFiller, type="ADD"}:props) {
  const {toast} = useToast()
  const {push} = useRouter()

  const [quiz, setQuiz] = useState<QuizFormState>(dataFiller||{
    title: "",
    description: "",
    duration: 0,
    questions: [],
  });
  const [noChanges, setNoChanges] = useState(true)

  const dispatch = useAppDispatch()
  const handleAddQuestion = (question: Question) => {
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, question],
    }));
  };
  const handleEditQuestion = (index:number, question: Question) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...question };
      return { ...prev, questions: updatedQuestions };
    });
  };
  const handleRemoveQuestion = (index: number) => {
    // setQuiz((prev) => ({
    //   ...prev,
    //   questions: prev.questions.filter((_, i) => i !== index),
    // }));
    toast({
      variant:"info",
      description:`Question ${index+1} has been deleted sucessfully`
    })
  };

  const handleChange = (field: string, value: any) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(()=>{
    if(JSON.stringify(quiz) === JSON.stringify(dataFiller) ){
      setNoChanges(true)
    }else{
      setNoChanges(false)
    }
  }, [dataFiller, quiz])
  const handleSubmit = async ()=>{
    const {description,duration,questions,title} = quiz
    if(title.trim()===""){
      toast({
        variant:"warning",
        description:"Title is required",

      })
      return
    }
    if(parseInt(`${duration}`)===0){
      toast({
        variant:"warning",
        description:"Test duration is required"
      })
      return
    }
    if(description.trim()===""){
      toast({
        variant:"warning",
        description:"Description is required"
      })
      return
    }
    if(questions.length<5){
      toast({
        variant:"warning",
        description:"Questions are required (at least 5)"
      })
      return
    }
    
    


    

    if(type==="ADD"){
      const createdBy = "Admin Asterixh"
    const createdAt = new Date().toISOString()
    const updatedAt = new Date().toISOString()
      dispatch(CreateQuiz({
        ...quiz,
        duration: parseInt(`${quiz.duration}`),
        createdBy,
        createdAt,
        updatedAt,
        _id:""
      })).then(()=>{
        toast({
          variant:"success",
          description:"Test added"
        })
      }).catch(()=>{
        toast({
          variant:"destructive",
          description:"Something went wrong"
        })
      })
    }else if(type==="EDIT"){
      dispatch(UpdateQuiz({
        ...quiz,
        duration: parseInt(`${quiz.duration}`),
      })).then(()=>{
        toast({
          variant:"success",
          description:"Test Updated successfully"
        })
        push(`/quizzes/${quiz._id}`)
      }).catch(()=>{
        toast({
          variant:"destructive",
          description:"Something went wrong"
        })
      })
      dispatch(fetchQuizById(`${quiz._id}`));
      
    }


  }


  return (
    <Card className="max-w-4xl mx-auto">
      <CardContent className="space-y-4 p-4">
        <h2 className="text-xl font-semibold">Add New Quiz</h2>
        <div>
          <Label>Title</Label>
          <Input
            value={quiz.title}
            onChange={(e) => handleChange("title", e.target.value)}
          />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea
            value={quiz.description}
            onChange={(e: any) => handleChange("description", e.target.value)}
          />
        </div>
        <div>
          <Label>Duration (minutes)</Label>
          <Input
            type="number"
            value={quiz.duration}
            onChange={(e) => handleChange("duration", e.target.value)}
          />
        </div>

        <h3 className="text-lg font-medium">Questions</h3>
        <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(200px,_1fr))] gap-2">
          {quiz.questions.map((question, index) => (
            <Card key={index} className="p-4 border flex flex-col gap-2">
              <h3 className="font-bold text-lg line-clamp-2">
                {question.text}
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  <span className="font-medium">Correct Answer:</span>{" "}
                  {question.correctAnswer}
                </p>
              </div>
              <div className="w-full flex items-center justify-end gap-2">
                <QuestionModal
                  trigger={
                    <Button variant={"secondary"}>
                      <PencilLine />
                    </Button>
                  }
                  actions={{
                    handleQuestionSave(question) {
                      handleEditQuestion(index,question )
                    },
                    handleRemoveQuestion,
                    type:"edit"
                  }}
                  index={index}
                  questionFill={question}
                />

                <UseModal trigger={<Button variant={"destructive"}>
                  <Trash2Icon />
                </Button>} contentHeader={{
                  title:`Delete Question ${index+1}`,
                  description: "Are you sure you want to delete this question?"
                }} contentFooter={{
                  children:<div className="w-full flex flex-col gap-3">
                  <DialogClose asChild>
                    <Button variant={"default"}>Cancel</Button>
                  </DialogClose>
                  <Button
                    variant={"destructive"}
                    onClick={() => handleRemoveQuestion(index)}
                  >
                    Yes, Delete
                  </Button>
                </div>
                }}></UseModal>
              </div>
            </Card>
          ))}
        </div>

        <QuestionModal
          trigger={
            <Button variant="outline">
              <Plus className="h-4 w-4" /> Add Question
            </Button>
          }
          actions={{ handleQuestionSave: handleAddQuestion, type:"add" }}
          index={quiz.questions.length}
        />
        <Button disabled={noChanges} className="w-full" onClick={handleSubmit}>{type==="ADD"?"Submit Quiz":"Save changes"}</Button>
      </CardContent>
    </Card>
  );
}
