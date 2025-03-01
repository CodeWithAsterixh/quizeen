"use client";

import { DeleteQuiz } from "@/lib/features/quizSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import React, { useState } from "react";
import UseModal from "./Modal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

type Props = {
  trigger: React.ReactNode;
  itemName: string;
  id: string;
};

export default function DeleteItemModal({ trigger, itemName, id }: Props) {
  const [inputVal, setinputVal] = useState("");
  const [open, setOpen] = useState(false);
  const { loading } = useAppSelector((s) => s.quiz);
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const handleDelete = async () => {
    try {
      await dispatch(DeleteQuiz(id));
      setOpen(false);
      toast({
        variant: "success",
        description: itemName+ " has been deleted",
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setOpen(true);
      toast({
        variant: "destructive",
        description: "Something went wrong, try again!",
      });
    }
  };

  return (
    <UseModal
      open={open}
      trigger={trigger}
      contentHeader={{
        title: "Delete permanantly",
        description: (
          <strong className="text-red-500">can&apos;t be restored!</strong>
        ),
      }}
      contentFooter={{
        children: (
          <div className="w-[20rem] max-w-full flex flex-col gap-3">
            <b className="font-normal">
              Type &ldquo;<i className="font-bold not-italic">{itemName}</i>
              &rdquo; to delete
            </b>
            <Input type="text" onChange={(e) => setinputVal(e.target.value)} />
            <Button
              disabled={inputVal !== itemName || loading}
              onClick={handleDelete}
              variant={"destructive"}
            >
              {" "}
              <Trash2Icon />
              Delete
              {loading&&<Loader2Icon className="text-neutral-100 animate-spin"/>}
              
            </Button>
          </div>
        ),
      }}
    ></UseModal>
  );
}
