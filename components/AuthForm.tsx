"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, registerUser } from "@/lib/features/authSlice"; // Async thunks from our auth slice
import { useAppDispatch } from "@/lib/hooks";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface AuthFormProps {
  type: "login" | "register"; // Distinguishes between login and registration modes
}

const AuthForm: React.FC<AuthFormProps> = ({ type }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)  

  const dispatch = useAppDispatch();
  const router = useRouter();

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
        await dispatch(loginUser({ email, password })).unwrap();
        router.push("/"); // Redirect to home on successful login
      } else {
        // Dispatch the register async thunk and unwrap the result
        await dispatch(registerUser({ fullName, email, password, confirmPassword })).unwrap();
        await dispatch(loginUser({ email, password })).unwrap();
        router.push("/"); // Redirect to login page after successful registration
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err || "An error occurred. Please try again.");
    }finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    if(error.trim() !== ""){
      toast.error(error)
    }

  }, [error])
  
  return (
    <div className="w-96 max-w-md mx-auto p-6 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-semibold mb-4">
        {type === "login" ? "Login" : "Register"}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
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
