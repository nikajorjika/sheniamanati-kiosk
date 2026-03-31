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
      {/* Ambient glow — uses CSS variable so it tracks the primary color */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full blur-[90px]"
        style={{ background: "color-mix(in oklch, var(--color-primary) 8%, transparent)" }}
      />

      {/* Logo mark */}
      <div className="relative flex flex-col items-center gap-6">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-2xl bg-surface-container-lowest"
          style={{ boxShadow: "0 0 48px var(--primary-glow)" }}
        >
          <Package className="h-14 w-14 text-primary" strokeWidth={1.5} />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <span
            className="text-5xl font-bold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            ამananatchegis gaTana
          </span>
          <span className="text-sm font-medium tracking-[0.25em] uppercase text-muted-foreground">
            gamoitanEt amanaTi
          </span>
        </div>
      </div>

      {/* Tap prompt */}
      <div className="absolute bottom-14 flex flex-col items-center gap-3">
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
          sheekhEt eQrans gasagrZelEblad
        </span>
      </div>

      {/* Corner accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-7 left-7 h-9 w-9 rounded-tl-md border-t-2 border-l-2 border-outline-variant/40" />
        <div className="absolute top-7 right-7 h-9 w-9 rounded-tr-md border-t-2 border-r-2 border-outline-variant/40" />
        <div className="absolute bottom-7 left-7 h-9 w-9 rounded-bl-md border-b-2 border-l-2 border-outline-variant/40" />
        <div className="absolute bottom-7 right-7 h-9 w-9 rounded-br-md border-b-2 border-r-2 border-outline-variant/40" />
      </div>
    </div>
  );
}
