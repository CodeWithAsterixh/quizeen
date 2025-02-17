"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/hooks";

interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    duration: number; // in minutes
    questionsCount: number;
  };
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const [isDone, setIsDone] = useState(false)
  const userCompleted = useAppSelector(s=>s.quiz.userCompleted)

  useEffect(() => {
    if(userCompleted.length>0&&userCompleted.find(q=>q.quizId===quiz._id)){
      setIsDone(true)
    }else{
      setIsDone(false)
    }
  }, [quiz._id, userCompleted])
  
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
        
        {
          isDone?<Link href={`/results/${userCompleted.find(q=>q.quizId===quiz._id)?._id}`}>
          <Button variant="success">
            See results
          </Button>
        </Link>:<Link href={`/quizzes/${quiz._id}`}>
          <Button variant="primary">
            Take Quiz
          </Button>
        </Link>
        }
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
