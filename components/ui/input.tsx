import * as React from "react"

import {Eye,EyeClosed} from 'lucide-react'
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const [shown, setShown] = React.useState(false)
    if(type === "password"){
      return(
        <div className="w-full flex items-center justify-center gap-2">
          <input
        type={shown?"text":"password"}
        className={cn(
          "flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300",
          className
        )}
        ref={ref}
        {...props}
      />
      <span onClick={()=>{
        setShown(!shown)
      }} className="w-10 flex items-center justify-center cursor-pointer text-neutral-500 hover:text-neutral-700 duration-300">
        {shown?<EyeClosed/>:<Eye/> }
      </span>
        </div>
      )
    }
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-neutral-800 dark:file:text-neutral-50 dark:placeholder:text-neutral-400 dark:focus-visible:ring-neutral-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
