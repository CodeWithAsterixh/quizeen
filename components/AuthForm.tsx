"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { loginUser, registerUser } from "@/lib/features/authSlice"; // Async thunks from our auth slice
import { useAppDispatch } from "@/lib/hooks";
import { AuthResponse } from "@/types";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface AuthFormProps {
  type: "login" | "register"; // Distinguishes between login and registration modes
  intercept?:true;
  onSuccess?:(res:AuthResponse)=>void
}

const AuthForm: React.FC<AuthFormProps> = ({ type,intercept,onSuccess }) => {
  const {toast} = useToast()
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)  

  const dispatch = useAppDispatch();
  const router = useRouter();

  const callSuccess = useCallback(
    (res:AuthResponse) => {
      if(intercept){
        if(onSuccess){
          onSuccess(res)
        }
      }else{
        router.push("/");
      }
    },
    [intercept, onSuccess, router],
  )
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true)
    // Validate password match for registration
    if (type === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false)
      return;
    }

    try {
      if (type === "login") {
        // Dispatch the login async thunk and unwrap the result
        const res = await dispatch(loginUser({ email, password })).unwrap();
        callSuccess(res)
      } else {
        // Dispatch the register async thunk and unwrap the result
        await dispatch(registerUser({ fullName, email, password, confirmPassword })).unwrap();
        const res = await dispatch(loginUser({ email, password })).unwrap();

        callSuccess(res)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err || "An error occurred. Please try again.");
      console.log(err)
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    if(typeof error == "string"&&error.trim() !== ""){
      toast({
        variant:"destructive",
        description:`${error}`
      })
    }

  }, [error, toast])
  
  return (
    <div className={
      clsx(
        "w-96 max-w-md mx-auto p-6 rounded-lg bg-white",
        intercept?"shadow-none":"shadow-lg"
      )
    }>
      
      {
        !intercept&&<h2 className="text-2xl font-semibold mb-4">
        {type === "login" ? "Login" : "Register"}
      </h2>
      }
      {error && <p className="text-red-500 mb-4">{`${error}`}</p>}
      <form onSubmit={handleSubmit}>
        {type === "register" && (
          <div className="mb-4">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
        )}
        <div className="mb-4">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {type === "register" && (
          <div className="mb-4">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>
        )}
        <Button type="submit" className="w-full flex items-center justify-center gap-2">
          {type === "login" ? "Login" : "Register"}
          {
            loading&&<Loader2 className="animate-spin"/>
          }
        </Button>
      </form>
    </div>
  );
};

export default AuthForm;
