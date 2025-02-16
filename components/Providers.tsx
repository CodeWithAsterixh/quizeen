"use client"

import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { SidebarProvider } from "./ui/sidebar";
import { TooltipProvider } from "./ui/tooltip";
import { ToastProvider } from "./ui/toast";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <ToastProvider>
      <TooltipProvider>

      <SidebarProvider>
      
      {children}
      </SidebarProvider>
      </TooltipProvider>
      </ToastProvider>

    </Provider>
  );
};
