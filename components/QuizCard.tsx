"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface QuizCardProps {
  quiz: {
    _id: string;
    title: string;
    duration: number; // in minutes
    questionsCount: number;
  };
}

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">Duration: {quiz.duration} minutes</p>
        <p className="text-gray-600">Questions: {quiz.questionsCount}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/quiz/${quiz._id}`}>
          <Button variant="destructive" className="w-full">
            Take Quiz
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default QuizCard;
