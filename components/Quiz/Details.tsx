"use client";
import { useAppSelector } from "@/lib/hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export default function Details({startQuiz}:{
  startQuiz:()=>void
}) {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);

  return (
  <Card>
    <CardHeader>
      <CardTitle>{currentQuiz?.title}</CardTitle>
      <CardDescription>{currentQuiz?.description}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600">
        Duration: {`${currentQuiz?.duration}`} minutes
      </p>
      <p className="text-sm text-gray-600">
        Created by: {`${currentQuiz?.createdBy}`}
      </p>
      {currentQuiz?.createdAt && (
        <p className="text-sm text-gray-500">
          Created at: {`${new Date(currentQuiz.createdAt).toLocaleString()}`}
        </p>
      )}
      {currentQuiz?.updatedAt && (
        <p className="text-sm text-gray-500">
          Updated at: {`${new Date(currentQuiz.updatedAt).toLocaleString()}`}
        </p>
      )}
      <Button variant={"success"} className="mt-3" onClick={startQuiz}>Start quiz</Button>
    </CardContent>
  </Card>
  );
}
