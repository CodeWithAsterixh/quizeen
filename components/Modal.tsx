"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState } from "react";

type props = {
  trigger?: React.ReactNode;
  triggerAsChild?: boolean;
  open?: boolean;
  contentHeader?: {
    title: React.ReactNode;
    description?: React.ReactNode;
  };
  contentFooter?: {
    children?: React.ReactNode;
  };
  /**use this for custom modal */
  others?: React.ReactNode;
  onClose?:()=>void
};
function UseModal({
  trigger,
  triggerAsChild = true,
  open,
  contentHeader,
  contentFooter,
  others,
  onClose
}: props) {
  const [opened, setOpened] = useState(open||false)
  return (
    <Dialog onClose={()=>{
      if(onClose)onClose()
      setOpened(false)
    }} open={opened}>
      {trigger && (
        <DialogTrigger onClick={()=>setOpened(true)} asChild={triggerAsChild}>{trigger}</DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md !px-2 sm:!px-6 scrollbar w-fit max-w-[98vw] sm:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="sticky top-0">
            {contentHeader?.title}
          </DialogTitle>
          <DialogDescription>{contentHeader?.description}</DialogDescription>
        </DialogHeader>
        {others}
        <DialogFooter>{contentFooter?.children}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UseModal;
