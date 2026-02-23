"use client";

import { cn } from "@/lib/utils";
import { Delete } from "lucide-react";

interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  disabled?: boolean;
}

const ROWS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

export function NumericKeypad({ onDigit, onDelete, disabled = false }: NumericKeypadProps) {
  return (
    <div className="grid w-full max-w-xs gap-3 select-none mx-auto">
      {ROWS.map((row) => (
        <div key={row.join("")} className="grid grid-cols-3 gap-3">
          {row.map((digit) => (
            <KeyButton
              key={digit}
              disabled={disabled}
              onClick={() => onDigit(digit)}
            >
              {digit}
            </KeyButton>
          ))}
        </div>
      ))}
      {/* Bottom row: empty spacer, 0, delete */}
      <div className="grid grid-cols-3 gap-3">
        <div />
        <KeyButton disabled={disabled} onClick={() => onDigit("0")}>
          0
        </KeyButton>
        <KeyButton
          disabled={disabled}
          onClick={onDelete}
          className="text-muted-foreground"
        >
          <Delete className="h-6 w-6" />
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
        "flex h-20 w-full items-center justify-center rounded-xl border border-border bg-card",
        "text-2xl font-semibold text-foreground",
        "transition-all duration-75",
        "active:scale-95 active:bg-primary/10 active:border-primary/50",
        "hover:bg-secondary hover:border-border",
        "disabled:opacity-40 disabled:pointer-events-none",
        "touch-manipulation",
        className
      )}
    >
      {children}
    </button>
  );
}
