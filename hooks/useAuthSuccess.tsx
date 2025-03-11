import { useToast } from "@/hooks/use-toast";
import { submitQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { AuthResponse } from "@/types";
import { authInterceptor } from "@/utils/authInterceptorNext";
import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
export const useAuthSuccess = (params?:authInterceptor| null) => {
  const { back,push } = useRouter();
  const dispatch = useAppDispatch();
  const { state, from } = useAppSelector((s) => s.anySlice);
  const { toast } = useToast();

  return useCallback(
    async (res: AuthResponse) => {
      console.log(state)
      if (res.user && state) {
        switch (from) {
          case "quiz-submit":
            try {
              await dispatch(
                submitQuiz({
                  answers: state.answers,
                  quizId: state.quizId,
                  userId: res.user._id,
                  role: res.user.role,
                  saveResult: true,
                })
              );
              
              toast({
                title: "Quiz saved successfully",
                icon: <Save />,
                variant: "success",
              });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
              toast({
                title: "Something went wrong",
                variant: "destructive",
              });
            }
            break;

          default:
            break;
        }
      }
      if(params?.url){
        push(params?.url)
      }else{
        back();
      }
      
    },
    [back, dispatch, from, params, push, state, toast]
  );
};
