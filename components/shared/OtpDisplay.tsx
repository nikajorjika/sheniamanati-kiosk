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
              // Spec: tonal slots — depth by bg shift, no border-2 (No-Line Rule)
              "flex items-center justify-center rounded-xl font-mono font-bold transition-all duration-150",
              compact ? "h-14 w-10 text-xl" : "h-20 w-14 text-3xl",
              // Error: ghost ring as accessibility fallback (spec allows outline_variant/15)
              error && "ring-1 ring-destructive/30 bg-destructive-subtle text-destructive",
              // Filled: primary_container bg + on_primary_container text
              !error && filled && "bg-primary-container text-primary-container-foreground",
              // Active cursor: surface_bright, animated
              !error && isActive && !filled && "bg-surface-bright animate-pulse text-foreground",
              // Empty default: surface_container_highest
              !error && !filled && !isActive && "bg-surface-container-highest text-muted-foreground",
            )}
            style={
              !error && filled
                ? { boxShadow: "0 0 16px var(--primary-glow-sm)" }
                : undefined
            }
          >
            {filled ? digits[i] : ""}
          </div>
        );
      })}
    </div>
  );
}
