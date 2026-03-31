"use client";

import { Package } from "lucide-react";

interface ScreensaverProps {
  onTouch: () => void;
}

export function Screensaver({ onTouch }: ScreensaverProps) {
  return (
    <div
      className="relative flex flex-col items-center justify-center w-screen h-screen gap-10 cursor-pointer select-none bg-background"
      onClick={onTouch}
      onTouchStart={onTouch}
    >
      {/* Ambient glow — uses CSS variable so it tracks the primary color */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-[90px]"
        style={{ background: "color-mix(in oklch, var(--color-primary) 8%, transparent)" }}
      />

      {/* Logo mark */}
      <div className="relative flex flex-col items-center gap-6">
        <div
          className="flex items-center justify-center h-28 w-28 rounded-2xl bg-surface-container-lowest"
          style={{ boxShadow: "0 0 48px var(--primary-glow)" }}
        >
          <Package className="h-14 w-14 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="text-5xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ამანათის გატანა
          </span>
          <span className="text-sm font-medium uppercase text-muted-foreground">
            შეიყვანეთ ოთახის ან პირადი ნომერი და მიიღეთ თქვენი ამანათი
          </span>
        </div>
      </div>

      {/* Tap prompt */}
      <div className="absolute flex flex-col items-center gap-3 bottom-14">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/40"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
        <span className="text-lg text-muted-foreground">
          შეეხეთ ეკრანს გასაგრძელებლად
        </span>
      </div>

      {/* Corner accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute border-t-2 border-l-2 top-7 left-7 h-9 w-9 rounded-tl-md border-outline-variant/40" />
        <div className="absolute border-t-2 border-r-2 top-7 right-7 h-9 w-9 rounded-tr-md border-outline-variant/40" />
        <div className="absolute border-b-2 border-l-2 bottom-7 left-7 h-9 w-9 rounded-bl-md border-outline-variant/40" />
        <div className="absolute border-b-2 border-r-2 bottom-7 right-7 h-9 w-9 rounded-br-md border-outline-variant/40" />
      </div>
    </div>
  );
}
