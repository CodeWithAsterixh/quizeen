"use client";
import { useAppSelector } from "@/lib/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import DeleteItemModal from "../DeleteItemModal";
import { PencilLine, Trash2Icon } from "lucide-react";
import Loader from "../loader";

export default function Details({ startQuiz }: { startQuiz: () => void }) {
  const currentQuiz = useAppSelector((s) => s.quiz.currentQuiz);
  const { role } = useAppSelector((s) => s.auth);
  if (!currentQuiz) return <Loader />;

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
        <div className="w-full flex items-center justify-between gap-2 mt-3">
          <Button variant={"success"} onClick={startQuiz}>
            Start quiz
          </Button>
          
          {role === "admin" && (
            <div className="flex items-center gap-2">
              <Link href={`/quizzes/${currentQuiz?._id}/edit`}>
                <Button variant={"ghost"}>
                  <PencilLine />
                  Edit
                </Button>
              </Link>
              <DeleteItemModal
                itemName={currentQuiz?.title}
                trigger={
                  <Button
                    variant={"destructive"}
                  >
                    <Trash2Icon />
                    Delete
                  </Button>
                }
                id={currentQuiz?._id}
              />
            </div>
          )}
          
        </div>
      </CardContent>
    </Card>
  );
}
