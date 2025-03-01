"use client";
import { fetchQuizById } from "@/lib/features/quizSlice";
import { useAppDispatch } from "@/lib/hooks";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (id) {
      dispatch(fetchQuizById(id));
    }
  }, [dispatch, id]);
  return children;
}
