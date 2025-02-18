"use client";
import AuthForm from "@/components/AuthForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { AuthResponse } from "@/types";
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type Props = object;

export default function Page({}: Props) {
  const { back } = useRouter();
  const {state,from} = useAppSelector(s=>s.anySlice)
  const {toast} = useToast()
  const dispatch = useAppDispatch()
  const successAction = useCallback(async (res: AuthResponse)=>{
    if(res.user && state){
      switch (from) {
        case "quiz-submit":
          try {
            await dispatch(submitQuiz({
              answers:state.answers,
              quizId:state.quizId,
              userId:res.user._id,
              role:res.user.role,
            }))
            toast({
              title: "Quiz saved successfully",
              icon:<Save/>,
              variant:"success"
            })
            
  
  
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            toast({
              title: "Something went wrong",
              variant:"destructive"
            })
          }
          break;
      
        default:
          break;
      }
    }
    back()

  },[back, dispatch, from, state, toast])
  return (
    <Dialog onClose={back} open>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md scrollbar !px-0 w-fit max-w-[98vw] sm:max-w-[90vw]">
        <DialogHeader className="!px-2 sm:!px-6">
          <DialogTitle className="sticky top-0">Authentication</DialogTitle>
          <DialogDescription>Login in to continue</DialogDescription>
        </DialogHeader>
        <AuthForm onSuccess={successAction} type="login" intercept/>
        <DialogFooter>
          <div className="w-96 max-w-md mx-auto flex items-center justify-center">
            <h2 className="text-base  text-gray-900">
              Don{"'"}t have an account
              <Link
                href="/auth/register"
                className="text-blue-600 hover:text-blue-800"
              >
                {" "}
                Sign up
              </Link>
            </h2>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
