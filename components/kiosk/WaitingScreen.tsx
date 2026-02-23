"use client";

import { CheckCircle2 } from "lucide-react";

export function WaitingScreen() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-background">
      {/* Success glow + icon */}
      <div className="relative flex items-center justify-center">
        <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-success/10 blur-[60px]" />
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-success/30 bg-success/10">
          <CheckCircle2 className="h-16 w-16 text-success" strokeWidth={1.5} />
        </div>
      </div>

      {/* Message */}
      <div className="max-w-sm space-y-3 text-center">
        <h1 className="text-3xl font-bold text-foreground">
          მოთხოვნა მიღებულია
        </h1>
        <p className="text-xl text-muted-foreground">
          თქვენი ამანათი მზადდება — გთხოვთ, დაიცადოთ
        </p>
      </div>

      {/* Pulsing dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-success/60"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
