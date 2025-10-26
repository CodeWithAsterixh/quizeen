"use client"
import { useAppSelector } from "@/lib/hooks";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const {role} = useAppSelector(s=>s.auth)
  if(role=="admin"||role=="student")return children
  return null
}
