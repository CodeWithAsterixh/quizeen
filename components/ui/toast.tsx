"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

type ToastViewportPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center"

type ToastViewportProps = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
  position?: ToastViewportPosition
}

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  ToastViewportProps
>(({ className, position = "top-right", ...props }, ref) => {
  let positionClasses = ""
  switch (position) {
    case "top-right":
      positionClasses =
        "fixed top-0 right-0 z-[100] p-4 flex flex-col md:max-w-[420px]"
      break
    case "top-left":
      positionClasses =
        "fixed top-0 left-0 z-[100] p-4 flex flex-col md:max-w-[420px]"
      break
    case "bottom-right":
      positionClasses =
        "fixed bottom-0 right-0 z-[100] p-4 flex flex-col-reverse md:max-w-[420px]"
      break
    case "bottom-left":
      positionClasses =
        "fixed bottom-0 left-0 z-[100] p-4 flex flex-col-reverse md:max-w-[420px]"
      break
    case "top-center":
      positionClasses =
        "fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] p-4 flex flex-col md:max-w-[420px]"
      break
    case "bottom-center":
      positionClasses =
        "fixed bottom-0 left-1/2 transform -translate-x-1/2 z-[100] p-4 flex flex-col-reverse md:max-w-[420px]"
      break
    default:
      positionClasses =
        "fixed top-0 right-0 z-[100] p-4 flex flex-col md:max-w-[420px]"
  }

  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(positionClasses, className)}
      {...props}
    />
  )
})
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border border-neutral-200 p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full dark:border-neutral-800",
  {
    variants: {
      variant: {
        default:
          "border bg-white text-neutral-950 dark:bg-neutral-950 dark:text-neutral-50",
        destructive:
          "destructive group border-red-500 bg-red-500 text-neutral-50 dark:border-red-900 dark:bg-red-900 dark:text-neutral-50",
        success:
          "border-green-500 bg-green-500 text-neutral-50 dark:border-green-900 dark:bg-green-900 dark:text-neutral-50",
        warning:
          "border-yellow-500 bg-yellow-500 text-neutral-950 dark:border-yellow-700 dark:bg-yellow-700 dark:text-neutral-50",
        info:
          "border-blue-500 bg-blue-500 text-neutral-50 dark:border-blue-900 dark:bg-blue-900 dark:text-neutral-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-neutral-200 bg-transparent px-3 text-sm font-medium transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-neutral-100/40 group-[.destructive]:hover:border-red-500/30 group-[.destructive]:hover:bg-red-500 group-[.destructive]:hover:text-neutral-50 group-[.destructive]:focus:ring-red-500 dark:border-neutral-800 dark:hover:bg-neutral-800 dark:focus:ring-neutral-300 dark:group-[.destructive]:border-neutral-800/40 dark:group-[.destructive]:hover:border-red-900/30 dark:group-[.destructive]:hover:bg-red-900 dark:group-[.destructive]:hover:text-neutral-50 dark:group-[.destructive]:focus:ring-red-900",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-neutral-950/50 opacity-0 transition-opacity hover:text-neutral-950 focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600 dark:text-neutral-50/50 dark:hover:text-neutral-50",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>
type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
