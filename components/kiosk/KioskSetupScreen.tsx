"use client";

import { useState } from "react";
import { Smartphone, X, RotateCcw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KioskShell } from "@/components/kiosk/KioskShell";
import type { KioskConfig } from "@/lib/kiosk-storage";

interface KioskSetupScreenProps {
  onActivate: (config: KioskConfig) => void;
}

export function KioskSetupScreen({ onActivate }: KioskSetupScreenProps) {
  const [shortCode, setShortCode] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shortCode || !accessCode) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/kiosk/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ short_code: shortCode, access_code: accessCode }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "გააქტიურება ვერ მოხერხდა");
        return;
      }

      onActivate({
        token: data.token,
        terminalId: data.terminal_id,
        terminalNumber: data.terminal_number,
        terminalName: data.terminal_name ?? null,
        terminalType: data.terminal_type,
        branchId: data.branch_id,
        branchName: data.branch_name,
      });
    } catch {
      setError("სერვერთან კავშირი ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setShortCode("");
    setAccessCode("");
    setError(null);
  }

  const footer = (
    <>
      <span />
      <button
        type="button"
        onClick={handleCancel}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
        გაუქმება
      </button>
    </>
  );

  return (
    <KioskShell footer={footer}>
      <div className="flex h-full items-center gap-16 px-16">

        {/* ── Left — branding ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-8 select-none">
          <div className="h-14 w-14 rounded-2xl bg-secondary-container flex items-center justify-center">
            <Smartphone className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>

          <div className="space-y-4">
            <h1
              className="text-5xl font-bold text-foreground leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              მოწყობილობის
              <br />
              აქტივაცია
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs">
              შეიყვანეთ ფილიალის მონაცემები პორტატული ტერმინალის სისტემაში
              დასარეგისტრირებლად.
            </p>
          </div>
        </div>

        {/* ── Right — form card ─────────────────────────────────── */}
        <div className="w-[440px] shrink-0">
          <div className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_40px_var(--primary-glow)] p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Short code */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-foreground"
                  htmlFor="short-code"
                >
                  ფილიალის კოდი
                </label>
                <div className="relative">
                  <Input
                    autoFocus
                    id="short-code"
                    value={shortCode}
                    onChange={(e) => setShortCode(e.target.value)}
                    placeholder="მაგ: TBS01"
                    className="h-14 text-base font-mono tracking-widest uppercase bg-background border-border pr-12"
                    disabled={loading}
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                  {/* Card icon */}
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="9" y1="7" x2="15" y2="7" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                  </svg>
                </div>
              </div>

              {/* Access code */}
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold text-foreground"
                  htmlFor="access-code"
                >
                  წვდომის კოდი
                </label>
                <div className="relative">
                  <Input
                    id="access-code"
                    type="password"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="••••••••"
                    className="h-14 text-base font-mono bg-background border-border pr-12"
                    disabled={loading}
                    autoComplete="off"
                  />
                  {/* Lock icon */}
                  <svg
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/50 pointer-events-none"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-destructive-subtle px-4 py-3">
                  <div className="shrink-0 mt-0.5 h-4 w-4 rounded-full bg-destructive flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold leading-none">!</span>
                  </div>
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={!shortCode || !accessCode || loading}
                className="w-full h-14 text-base font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 gap-3"
              >
                {loading ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    გPublication...
                  </>
                ) : (
                  <>
                    გPublication
                    <Wifi className="h-4 w-4 opacity-60" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

      </div>
    </KioskShell>
  );
}
