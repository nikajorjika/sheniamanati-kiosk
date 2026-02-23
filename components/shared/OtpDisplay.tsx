"use client";

import { cn } from "@/lib/utils";

interface OtpDisplayProps {
  digits: string[];
  length?: number;
  /** index of the next empty slot (acts as cursor position) */
  activeIndex: number;
  error?: boolean;
}

export function OtpDisplay({
  digits,
  length = 6,
  activeIndex,
  error = false,
}: OtpDisplayProps) {
  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length }).map((_, i) => {
        const filled = i < digits.length && digits[i] !== "";
        const isActive = i === activeIndex;

        return (
          <div
            key={i}
            className={cn(
              "flex h-20 w-14 items-center justify-center rounded-xl border-2 font-mono text-3xl font-bold transition-all duration-150",
              // Error state
              error && "border-destructive bg-destructive/10 text-destructive",
              // Normal states (only when not error)
              !error && filled && "border-primary bg-primary/10 text-primary shadow-[0_0_16px_oklch(0.78_0.19_55/0.25)]",
              !error && isActive && !filled && "border-primary animate-pulse bg-card text-foreground",
              !error && !filled && !isActive && "border-border bg-card text-foreground",
            )}
          >
            {filled ? digits[i] : ""}
          </div>
        );
      })}
    </div>
  );
}
