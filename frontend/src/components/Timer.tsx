"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  timeLimit: number;
  initialRemaining: number;
}

export default function Timer({ timeLimit, initialRemaining }: TimerProps) {
  const [remaining, setRemaining] = useState(initialRemaining);

  useEffect(() => {
    if (remaining <= 0) return;

    const interval = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const percentage = (remaining / timeLimit) * 100;
  const isWarning = percentage < 20;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border backdrop-blur-sm ${
      isWarning
        ? "bg-amber-50/80 border-amber-200/60"
        : "bg-white/60 border-slate-200/50"
    }`}>
      <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
        isWarning ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
      }`} />
      <svg
        className={`w-4 h-4 ${isWarning ? "text-amber-500" : "text-slate-500"}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={`font-mono text-lg font-bold tabular-nums ${
        isWarning ? "text-amber-600" : "text-slate-700"
      }`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  );
}