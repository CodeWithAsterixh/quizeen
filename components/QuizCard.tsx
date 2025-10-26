"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/lib/hooks";
import { PencilLine, Trash2Icon } from "lucide-react";
import Link from "next/link";
import React from "react";
import DeleteItemModal from "./DeleteItemModal";

interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    duration: number; // in minutes
    questionsCount: number;
  };
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const {role} = useAppSelector(s=>s.auth)


  
  return (
    <Card className="shadow-lg flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Duration: {quiz.duration} minutes</p>
        <p className="text-gray-600">Questions: {quiz.questionsCount}</p>
      </CardContent>
      <CardFooter className="flex items-center gap-2 flex-wrap">
        
        <Link href={`/quizzes/${quiz._id}`}>
          <Button variant="primary">
            Take Quiz
          </Button>
        </Link>
  {(role === "admin" || role === "creator") && <>
          <Link href={`/quizzes/${quiz._id}/edit`}>
        <Button variant={"ghost"} className="!px-2.5 rounded-full">
          <PencilLine/>
          </Button>
        </Link>
        <DeleteItemModal itemName={quiz.title} trigger={
          <Button variant={"destructive"} className="!px-2.5 rounded-full">
          <Trash2Icon/>
          </Button>
        } id={quiz._id} />
        </>}
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
