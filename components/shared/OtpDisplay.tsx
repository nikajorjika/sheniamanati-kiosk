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
              "flex items-center justify-center font-mono font-bold transition-all duration-150 border-b-2",
              compact ? "h-14 w-10 text-xl" : "h-20 w-14 text-3xl",
              error && "border-destructive text-destructive",
              !error && filled && "border-primary text-foreground",
              !error && isActive && !filled && "border-primary animate-pulse",
              !error && !filled && !isActive && "border-border text-muted-foreground",
            )}
          >
            {filled ? digits[i] : ""}
          </div>
        );
      })}
    </div>
  );
}
