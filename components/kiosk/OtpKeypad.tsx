"use client";

import { useState } from "react";
import { Smartphone, AlertCircle, RotateCcw, X } from "lucide-react";
import { NumericKeypad } from "@/components/shared/NumericKeypad";
import { OtpDisplay } from "@/components/shared/OtpDisplay";
import { KioskShell } from "@/components/kiosk/KioskShell";

interface OtpKeypadProps {
  terminalTitle?: string;
  phoneLastThree: string;
  onConfirm: (otp: string) => Promise<{ valid: boolean; error?: string }>;
  onResend: () => Promise<void>;
  onCancel: () => void;
}

const LENGTH = 6;

export function OtpKeypad({ terminalTitle, phoneLastThree, onConfirm, onResend, onCancel }: OtpKeypadProps) {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

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

  function handleSubmit() {
    if (digits.length < 1 || submitting) return;
    submit(digits);
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

  async function handleResend() {
    setResending(true);
    setError(null);
    setDigits([]);
    await onResend();
    setResending(false);
  }

  const cancelButton = (
    <button
      onClick={onCancel}
      disabled={submitting}
      className="flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
    >
      <X className="w-4 h-4" />
      გაუქმება
    </button>
  );

  return (
    <KioskShell title={terminalTitle} headerRight={cancelButton}>
      <div className="flex flex-col items-center justify-center h-full gap-10 px-8 py-8">
        {/* Heading + phone hint */}
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase text-primary">
            ნაბიჯი 2 / 2
          </p>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "var(--font-display)" }}
          >
            შეიყვანეთ SMS კოდი
          </h1>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-surface-container">
            <Smartphone className="w-5 h-5 shrink-0 text-muted-foreground" />
            <span className="font-mono text-base text-muted-foreground">
              მობილურზე{" "}
              <span className="tracking-widest text-foreground">
                *** ** ** {phoneLastThree}
              </span>
            </span>
          </div>
        </div>

        {/* OTP display + resend + error */}
        <div className="flex flex-col items-center gap-4">
          <OtpDisplay
            digits={digits}
            length={LENGTH}
            activeIndex={digits.length}
            error={!!error}
          />
          <button
            onClick={handleResend}
            disabled={resending || submitting}
            className="flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            <RotateCcw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
            {resending ? "იგზავნება..." : "კოდის ხელახლა გაგზავნა"}
          </button>
          {error && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Keypad */}
        <NumericKeypad
          onDigit={handleDigit}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          submitDisabled={digits.length < 1}
          disabled={submitting || resending}
        />
      </div>
    </KioskShell>
  );
}
