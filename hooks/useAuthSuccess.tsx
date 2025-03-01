import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { submitQuiz } from "@/lib/features/quizSlice";
import { AuthResponse } from "@/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

export const useAuthSuccess = () => {
  const { back } = useRouter();
  const dispatch = useAppDispatch();
  const { state, from } = useAppSelector((s) => s.anySlice);
  const { saveResults } = useAppSelector((s) => s.settings);
  const { toast } = useToast();

  return useCallback(
    async (res: AuthResponse) => {
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
                  saveResult: saveResults,
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
      back();
    },
    [back, dispatch, from, saveResults, state, toast]
  );
};
