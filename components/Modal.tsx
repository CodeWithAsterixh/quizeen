import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";

type props = {
  trigger: React.ReactNode;
  triggerAsChild?:boolean;
  contentHeader?: {
    title: React.ReactNode;
    description?: React.ReactNode;
  };
  contentFooter?: {
    children?: React.ReactNode;
  };
  /**use this for custom modal */
  others?: React.ReactNode;
};
function UseModal({ trigger, triggerAsChild=true, contentHeader, contentFooter, others }: props) {
  return (
    <Dialog>
      <DialogTrigger asChild={triggerAsChild}>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md !px-2 sm:!px-6 scrollbar w-fit max-w-[98vw] sm:max-w-[90vw]">
      <DialogHeader>
              <DialogTitle className="sticky top-0">{contentHeader?.title}</DialogTitle>
              <DialogDescription>
                {contentHeader?.description}
              </DialogDescription>
            </DialogHeader>
            {others}
            <DialogFooter>{contentFooter?.children}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UseModal;
