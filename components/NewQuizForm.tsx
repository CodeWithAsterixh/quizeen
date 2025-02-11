/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch } from "@/lib/hooks";
import { Question } from "@/types";
import { PencilLine, Plus, Trash2Icon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import UseModal from "./Modal";
import QuestionModal from "./QuestionModal";
import { DialogClose } from "./ui/dialog";
import { Textarea } from "./ui/textarea";

export default function AddQuizForm() {
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    duration: "",
    questions: [] as Question[],
  });

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
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (field: string, value: any) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async ()=>{
    const {description,duration,questions,title} = quiz
    if(title.trim()===""){
      toast.error("Title is required")
      return
    }
    if(duration.trim()===""){
      toast.error("Test duration is required")
      return
    }
    if(description.trim()===""){
      toast.error("Description is required")
      return
    }
    if(questions.length<5){
      toast.error("Questions are required (at least 5)")
      return
    }
    toast.success("well done, you can save test")
    const createdBy = "Admin Asterixh"
    const createdAt = new Date().toISOString()
    const updatedAt = new Date().toISOString()

    dispatch(CreateQuiz({
      ...quiz,
      duration: parseInt(quiz.duration),
      createdBy,
      createdAt,
      updatedAt,
      _id:""
    }))


  }


  return (
    <Card>
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
        <Button className="w-full" onClick={handleSubmit}>Submit Quiz</Button>
      </CardContent>
    </Card>
  );
}
