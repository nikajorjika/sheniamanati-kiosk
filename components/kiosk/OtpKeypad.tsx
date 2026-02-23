"use client";

import { useState } from "react";
import { Smartphone, AlertCircle } from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { OtpDisplay } from "@/components/shared/OtpDisplay";

interface OtpKeypadProps {
  phoneLastThree: string;
  onConfirm: (otp: string) => Promise<{ valid: boolean; error?: string }>;
}

const LENGTH = 6;

export function OtpKeypad({ phoneLastThree, onConfirm }: OtpKeypadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setError(result.error ?? "კოდი არასწორია. სცადეთ თავიდან.");
      setDigits([]);
    }
    setSubmitting(false);
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-between bg-background py-10 px-8">
      {/* Spacer */}
      <div />

      <div className="flex flex-col items-center gap-8">
        {/* Heading */}
        <div className="text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">
            ნაბიჯი 2 / 2
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            შეიყვანეთ SMS კოდი
          </h1>
        </div>

        {/* Phone hint */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-3">
          <Smartphone className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className="font-mono text-base text-muted-foreground">
            მობილურზე{" "}
            <span className="text-foreground tracking-widest">
              *** ** ** {phoneLastThree}
            </span>
          </span>
        </div>

        {/* OTP display */}
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
        disabled={submitting}
      />
    </div>
  );
}
