"use client"
import AuthForm from "@/components/AuthForm";
import { useAuthSuccess } from "@/hooks/useAuthSuccess";
import { AuthResponse } from "@/types";
import { AuthInterceptor } from "@/utils/authInterceptorNext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";


export default function Page() {
  const searchParams = useSearchParams()
  const _next = searchParams.get("_next") as unknown as string | null;
  const _next_obj = JSON.parse(_next||`{}`) as AuthInterceptor
  const successAction = useAuthSuccess(_next_obj);
  const handleSuccessAction = (res: AuthResponse)=>{
    successAction(res)
  }

  return (
    <div className="flex h-screen flex-col gap-9 items-center justify-center bg-gradient-to-br from-neutral-100 to-slate-300">
      <AuthForm type="login" intercept={_next_obj?.url?true:undefined} onSuccess={handleSuccessAction} />
      <div className="w-96 max-w-md mx-auto flex items-center justify-center">
        <h2 className="text-base  text-gray-900">
          Don{"'"}t have an account
          <Link href="/auth/register" className="text-blue-600 hover:text-blue-800">
            {" "}
            Sign up
          </Link>
        </h2>
      </div>
    </div>
  );
}
