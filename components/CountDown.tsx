/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { Timer } from "lucide-react";

interface MinuteCountdownProps {
  minutes: number;
  setEnd:(end:boolean)=>void
}

export function MinuteCountdown({ minutes,setEnd }: MinuteCountdownProps) {
  // Convert minutes to seconds for internal state.
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  useEffect(() => {
    // Reset the timer when the prop changes.
    setSecondsLeft(minutes * 60);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEnd(true)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [minutes]);


  // Helper to format seconds into mm:ss format.
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-md shadow">
      <Timer className="w-6 h-6 text-neutral-900 dark:text-neutral-50" />
      <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        {formatTime(secondsLeft)}
      </span>
    </div>
  );
}
