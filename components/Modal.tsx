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
  contentHeader?: {
    title: React.ReactNode;
    description: React.ReactNode;
  };
  contentFooter?: {
    children: React.ReactNode;
  };
  /**use this for custom modal */
  others?: React.ReactNode;
};
function UseModal({ trigger, contentHeader, contentFooter, others }: props) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        {others ? (
          others
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{contentHeader?.title}</DialogTitle>
              <DialogDescription>
                {contentHeader?.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>{contentFooter?.children}</DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default UseModal;
