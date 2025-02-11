/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Trash } from "lucide-react";
import { Textarea } from "./ui/textarea";

interface Question {
  text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
}

export default function AddQuizForm() {
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    duration: "",
    questions: [] as Question[],
  });

  const handleAddQuestion = () => {
    setQuiz((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          options: { A: "", B: "", C: "", D: "" },
          correctAnswer: "A",
        },
      ],
    }));
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

  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
      return { ...prev, questions: updatedQuestions };
    });
  };

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
            onChange={(e:any) => handleChange("description", e.target.value)}
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
        {quiz.questions.map((question, index) => (
          <Card key={index} className="p-4 border">
            <div>
              <Label>Question {index + 1}</Label>
              <Textarea
                value={question.text}
                onChange={(e:any) => handleQuestionChange(index, "text", e.target.value)}
              />
            </div>
            <div>
              <Label>Options</Label>
              {(["A", "B", "C", "D"] as const).map((key) => (
                <Input
                  key={key}
                  placeholder={`Option ${key}`}
                  value={question.options[key]}
                  onChange={(e) =>
                    handleQuestionChange(index, "options", {
                      ...question.options,
                      [key]: e.target.value,
                    })
                  }
                />
              ))}
            </div>
            <div>
              <Label>Correct Answer</Label>
              <RadioGroup
                value={question.correctAnswer}
                onChange={(value) => handleQuestionChange(index, "correctAnswer", value)}
              >
                {(["A", "B", "C", "D"] as const).map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <RadioGroupItem value={key} id={`${index}-${key}`} />
                    <Label htmlFor={`${index}-${key}`}>{key}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <Button variant="destructive" onClick={() => handleRemoveQuestion(index)}>
              <Trash className="h-4 w-4" /> Remove Question
            </Button>
          </Card>
        ))}
        <Button variant="outline" onClick={handleAddQuestion}>
          <Plus className="h-4 w-4" /> Add Question
        </Button>
        <Button className="w-full">Submit Quiz</Button>
      </CardContent>
    </Card>
  );
}
