"use client";

import { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { OtpDisplay } from "@/components/shared/OtpDisplay";
import { KioskShell } from "@/components/kiosk/KioskShell";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";

interface RoomKeypadProps {
  terminalTitle?: string;
  onConfirm: (roomNumber: string) => Promise<{ valid: boolean; error?: string }>;
  onBack: () => void;
  loading?: boolean;
}

const MAX_LENGTH = 11;
const MIN_LENGTH = 1;
const INACTIVITY_MS = 60_000;

export function RoomKeypad({ terminalTitle, onConfirm, onBack, loading = false }: RoomKeypadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useInactivityTimer(INACTIVITY_MS, onBack);

  function handleDigit(d: string) {
    if (digits.length >= MAX_LENGTH || submitting) return;
    setError(null);
    const next = [...digits, d];
    setDigits(next);
    if (next.length === MAX_LENGTH) submit(next);
  }

  function handleDelete() {
    if (submitting) return;
    setError(null);
    setDigits((prev) => prev.slice(0, -1));
  }

  function handleSubmit() {
    if (digits.length < MIN_LENGTH || submitting) return;
    submit(digits);
  }

  async function submit(filled: string[]) {
    setSubmitting(true);
    const result = await onConfirm(filled.join(""));
    if (!result.valid) {
      setError(result.error ?? "ნომერი ვერ მოიძებნა");
      setDigits([]);
    }
    setSubmitting(false);
  }

  const cancelButton = (
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <X className="h-4 w-4" />
      გაუქმება
    </button>
  );

  return (
    <KioskShell title={terminalTitle} headerRight={cancelButton}>
      <div className="flex flex-col items-center justify-center h-full gap-10 py-8 px-8">
        {/* Heading */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary">
            ნაბიჯი 1 / 2
          </p>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            შეიყვანეთ ოთახის ან პირადი ნომერი
          </h1>
        </div>

        {/* Input display + error */}
        <div className="flex flex-col items-center gap-4">
          <OtpDisplay
            digits={digits}
            length={MAX_LENGTH}
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
          onSubmit={handleSubmit}
          submitDisabled={digits.length < MIN_LENGTH}
          disabled={submitting || loading}
        />
      </div>
    </KioskShell>
  );
}
