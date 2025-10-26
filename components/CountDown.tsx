/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";
import { selectedOptions } from "@/types";

interface MinuteCountdownProps {
  minutes: number;
  setEnd:(end:boolean, answers:Record<number, selectedOptions>)=>void
  show:boolean
}

export function MinuteCountdown({ minutes,setEnd,show }: MinuteCountdownProps) {
  // Convert minutes to seconds for internal state.
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    // Reset the timer when the prop changes.
    setSecondsLeft(minutes * 60);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Let the state reach 0 and clear the interval. Do NOT call parent setters here
          // to avoid updating parent state during a render phase of this component.
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [minutes]);

  // Call parent 'setEnd' from an effect that reacts to secondsLeft changes.
  // This ensures we don't trigger parent updates during this component's render phase.
  useEffect(() => {
    if (secondsLeft === 0) {
      // schedule on next tick inside effect to be extra-safe
      const t = setTimeout(() => setEnd(true, {}), 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [secondsLeft, setEnd]);


  // Helper to format seconds into mm:ss format.
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if(!show)return null

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-md shadow">
      <Timer className="w-6 h-6 text-neutral-900 dark:text-neutral-50" />
      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}
