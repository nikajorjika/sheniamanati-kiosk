"use client";

import { cn } from "@/lib/utils";
import { Delete, ArrowRight } from "lucide-react";

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  submitDisabled?: boolean;
  disabled?: boolean;
}

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

export function NumericKeypad({
  onDigit,
  onDelete,
  onSubmit,
  submitDisabled = false,
  disabled = false,
}: NumericKeypadProps) {
  return (
    <div className="grid w-full max-w-xs gap-3 select-none mx-auto">
      {ROWS.map((row) => (
        <div key={row.join("")} className="grid grid-cols-3 gap-3">
          {row.map((digit) => (
            <KeyButton key={digit} disabled={disabled} onClick={() => onDigit(digit)}>
              {digit}
            </KeyButton>
          ))}
        </div>
      ))}
      {/* Bottom row: delete · 0 · submit */}
      <div className="grid grid-cols-3 gap-3">
        <KeyButton
          disabled={disabled}
          onClick={onDelete}
          className="text-muted-foreground"
        >
          <Delete className="h-6 w-6" />
        </KeyButton>
        <KeyButton disabled={disabled} onClick={() => onDigit("0")}>
          0
        </KeyButton>
        <KeyButton
          disabled={disabled || submitDisabled}
          onClick={onSubmit}
          className="bg-primary-gradient text-primary-foreground hover:brightness-110 active:brightness-95"
        >
          <ArrowRight className="h-6 w-6" />
        </KeyButton>
      </div>
    </div>
  );
}

function KeyButton({
  children,
  onClick,
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Spec: 80dp × 80dp keys, surface_container_lowest bg, xl rounded, no border
        "flex h-20 w-full items-center justify-center rounded-2xl bg-surface-container-lowest",
        "text-3xl font-bold text-foreground",
        "transition-all duration-75",
        "active:scale-95 active:bg-surface-container",
        "hover:bg-surface-container-low",
        "disabled:opacity-40 disabled:pointer-events-none",
        "touch-manipulation",
        "shadow-sm",
        className
      )}
    >
      {children}
    </button>
  );
}
