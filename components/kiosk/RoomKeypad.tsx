"use client";

import { useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { OtpDisplay } from "@/components/shared/OtpDisplay";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";

interface RoomKeypadProps {
  onConfirm: (roomNumber: string) => Promise<{ valid: boolean; error?: string }>;
  onBack: () => void;
  loading?: boolean;
}

const LENGTH = 6;
const INACTIVITY_MS = 60_000;

export function RoomKeypad({ onConfirm, onBack, loading = false }: RoomKeypadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 60s inactivity → go back to screensaver
  useInactivityTimer(INACTIVITY_MS, onBack);

  function handleDigit(d: string) {
    if (digits.length >= LENGTH || submitting) return;
    setError(null);
    const next = [...digits, d];
    setDigits(next);
    if (next.length === LENGTH) submit(next);
  }

  function handleDelete() {
    if (submitting) return;
    setError(null);
    setDigits((prev) => prev.slice(0, -1));
  }

  async function submit(filled: string[]) {
    setSubmitting(true);
    const result = await onConfirm(filled.join(""));
    if (!result.valid) {
      setError(result.error ?? "ოთახის ნომერი ვერ მოიძებნა");
      setDigits([]);
    }
    setSubmitting(false);
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-between bg-background py-10 px-8">
      {/* Back button */}
      <div className="w-full max-w-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">უკან</span>
        </button>
      </div>

      {/* Heading + display */}
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">
            ნაბიჯი 1 / 2
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            შეიყვანეთ ოთახის ნომერი
          </h1>
        </div>

        <OtpDisplay
          digits={digits}
          length={LENGTH}
          activeIndex={digits.length}
          error={!!error}
        />

        {error && (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      {/* Keypad */}
      <NumericKeypad
        onDigit={handleDigit}
        onDelete={handleDelete}
        disabled={submitting || loading}
      />
    </div>
  );
}
