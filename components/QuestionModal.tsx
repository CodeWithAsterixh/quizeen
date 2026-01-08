"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Question } from "@/types";
import clsx from "clsx";
import { Trash } from "lucide-react";
import React, { useState } from "react";
import UseModal from "./Modal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { DialogClose } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ToastViewport } from "./ui/toast";

type Props = {
  
  index: number;  
  trigger?: React.ReactNode;
  actions?:{
    handleQuestionSave?: (question: Question) => void;
    handleRemoveQuestion?: (index: number) => void
    type?:'edit'|'add'
  }
  questionFill?:Question;
};

export default function QuestionModal({
  index,
  trigger,
  actions,
  questionFill
}: Readonly<Props>) {
  const {toast} = useToast()
  const [question, setQuestion] = useState<Question>(questionFill||{
    _id: Math.random().toString(36).substring(2, 9),
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "A",
  });

  
  const handleQuestionChange = (field: string, value: any) => {
    setQuestion((prev) => ({ ...prev, [field]: value }));
  };
  const handleSave = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    // Stop event propagation right away.
    e.stopPropagation();
  
    // Validate that the question text and correct answer are provided.
    if (question.text.trim() === "" || question.correctAnswer.trim() === "") {
      toast({
        variant:"warning",
        description:"Please fill in the question text and select the correct answer",
      });
      return;
    }
  
    // Check that all options (A, B, C, D) are filled.
    const emptyOption = (Object.keys(question.options) as Array<"A" | "B" | "C" | "D">).find(
      (key) => question.options[key].trim() === ""
    );
  
    if (emptyOption) {
      toast({
        variant:"warning",
        description:"Please fill all options",
      });
      return;
    }
  
    // All validations pass.
    toast({
      variant:"success",
      description:"Question saved successfully"
    });
    if(actions?.handleQuestionSave){
        actions?.handleQuestionSave(question);
       
    }
    setQuestion({
        _id: Math.random().toString(36).substring(2, 11),
        text: "",
        options: { A: "", B: "", C: "", D: "" },
        correctAnswer: "A",
      })
  };
  
  const handleOptionChange = (key: "A" | "B" | "C" | "D", value: string) => {
    handleQuestionChange("options", {
      ...question?.options,
      [key]: value,
    });
  };

  const handleRemove = () => {
    if (actions?.handleRemoveQuestion) {
      actions.handleRemoveQuestion(index);
    }
  };

  const renderOptions = () => {
    return (["A", "B", "C", "D"] as const).map((key) => (
      <Input
        key={key}
        placeholder={`Option ${key}`}
        value={question?.options[key]}
        onChange={(e) => handleOptionChange(key, e.target.value)}
      />
    ));
  };

  const renderCorrectAnswerOptions = () => {
    return (["A", "B", "C", "D"] as const).map((key) => (
      <div
        key={key}
        className="flex items-center space-x-2"
      >
        <RadioGroupItem
          value={key}
          id={`${index}-${key}`}
          className={clsx({
            "!border-blue-500": question?.correctAnswer === key,
          })}
        />
        <Label htmlFor={`${index}-${key}`} className="cursor-pointer">
          {key}
        </Label>
      </div>
    ));
  };

  return (
    <>
      <UseModal
        trigger={trigger}
        contentHeader={{
          title: "Add new question",
        }}
        others={
          <Card key={index} className="w-[80vw] p-4 border flex flex-col gap-2">
            <div>
              <Label>Question {index + 1}</Label>
              <Textarea
                value={question?.text}
                onChange={(e: any) =>
                  handleQuestionChange("text", e.target.value)
                }
                className="min-h-52 resize-none scrollbar"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Options</Label>
              {renderOptions()}
            </div>
            <div>
              <Label>Correct Answer</Label>
              <RadioGroup
                value={question?.correctAnswer}
                onValueChange={(value) => handleQuestionChange("correctAnswer", value)}
                className="flex gap-5 flex-row p-2"
              >
                {renderCorrectAnswerOptions()}
              </RadioGroup>
            </div>
            <div className="w-full flex gap-3">
              <DialogClose asChild>
                {actions?.type === "add" ? (
                  <Button variant="default">Cancel</Button>
                ) : (
                  <Button variant="destructive" onClick={handleRemove}>
                    <Trash className="h-4 w-4" /> Remove Question
                  </Button>
                )}
              </DialogClose>

              <DialogClose asChild>
                <Button variant="default" onClick={handleSave}>
                  Save
                </Button>
              </DialogClose>
            </div>
          </Card>
        }
      />
      <ToastViewport position="top-left" />
    </>
  );
}
