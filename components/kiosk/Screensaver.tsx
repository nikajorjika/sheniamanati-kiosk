"use client";

import { Package } from "lucide-react";

interface ScreensaverProps {
  onTouch: () => void;
}

export function Screensaver({ onTouch }: ScreensaverProps) {
  return (
    <div
      className="relative flex h-screen w-screen cursor-pointer flex-col items-center justify-center gap-10 select-none bg-background"
      onClick={onTouch}
      onTouchStart={onTouch}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-primary/10 blur-[90px]" />

      {/* Logo mark */}
      <div className="relative flex flex-col items-center gap-6">
        <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-primary/25 bg-card shadow-[0_0_48px_oklch(0.78_0.19_55/0.12)]">
          <Package className="h-14 w-14 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-5xl font-bold tracking-tight text-foreground">
            ამანათების გატანა
          </span>
          <span className="text-sm font-medium tracking-[0.25em] uppercase text-muted-foreground">
            გამოიტანეთ ამანათი
          </span>
        </div>
      </div>

      {/* Tap prompt */}
      <div className="absolute bottom-14 flex flex-col items-center gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/50"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
        <span className="text-lg text-muted-foreground">
          შეეხეთ ეკრანს გასაგრძელებლად
        </span>
      </div>

      {/* Corner accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-7 left-7 h-9 w-9 rounded-tl-md border-t-2 border-l-2 border-primary/20" />
        <div className="absolute top-7 right-7 h-9 w-9 rounded-tr-md border-t-2 border-r-2 border-primary/20" />
        <div className="absolute bottom-7 left-7 h-9 w-9 rounded-bl-md border-b-2 border-l-2 border-primary/20" />
        <div className="absolute bottom-7 right-7 h-9 w-9 rounded-br-md border-b-2 border-r-2 border-primary/20" />
      </div>
    </div>
  );
}
