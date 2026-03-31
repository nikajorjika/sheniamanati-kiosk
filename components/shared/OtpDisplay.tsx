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
  const compact = length > 6;
  return (
    <div className="flex gap-2 justify-center flex-wrap">
      {Array.from({ length }).map((_, i) => {
        const filled = i < digits.length && digits[i] !== "";
        const isActive = i === activeIndex;

        return (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center rounded-xl border-2 font-mono font-bold transition-all duration-150",
              compact ? "h-14 w-10 text-xl" : "h-20 w-14 text-3xl",
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
