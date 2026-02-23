"use client";

import { useState } from "react";
import { Tablet } from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { Button } from "@/components/ui/button";

interface TabletSetupProps {
  onConfirm: (tabletId: string) => void;
}

export function TabletSetup({ onConfirm }: TabletSetupProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const MAX = 3;

  function handleDigit(d: string) {
    if (digits.length >= MAX) return;
    setDigits((prev) => [...prev, d]);
  }

  function handleDelete() {
    setDigits((prev) => prev.slice(0, -1));
  }

  function handleConfirm() {
    if (digits.length === MAX) onConfirm(digits.join(""));
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-8 bg-background px-8">
      {/* Icon + heading */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-card">
          <Tablet className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-1">
            ერთჯერადი დაყენება
          </p>
          <h1 className="text-2xl font-bold text-foreground">
            შეიყვანეთ ტერმინალის ნომერი
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ეს გამოიყენება მოთხოვნების სწორ ტერმინალთან დასაკავშირებლად
          </p>
        </div>
      </div>

      {/* Display */}
      <div className="flex gap-3">
        {Array.from({ length: MAX }).map((_, i) => (
          <div
            key={i}
            className={`flex h-20 w-14 items-center justify-center rounded-xl border-2 font-mono text-3xl font-bold transition-all ${
              i < digits.length
                ? "border-primary bg-primary/10 text-primary"
                : i === digits.length
                  ? "border-primary animate-pulse bg-card"
                  : "border-border bg-card"
            }`}
          >
            {digits[i] ?? ""}
          </div>
        ))}
      </div>

      {/* Keypad */}
      <NumericKeypad onDigit={handleDigit} onDelete={handleDelete} />

      {/* Confirm */}
      <Button
        onClick={handleConfirm}
        disabled={digits.length < MAX}
        className="h-14 w-full max-w-xs rounded-xl bg-primary text-lg font-semibold text-primary-foreground disabled:opacity-30"
      >
        დადასტურება
      </Button>
    </div>
  );
}
