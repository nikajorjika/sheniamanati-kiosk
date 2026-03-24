"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-background">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute h-96 w-96 rounded-full bg-primary/8 blur-[120px]" />

      <div className="relative w-full max-w-sm px-6 space-y-8">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto border rounded-xl border-border bg-card shadow-sm">
            <KeyRound className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">კიოსკის გააქტიურება</h1>
          <p className="text-sm text-muted-foreground">შეიყვანეთ კიოსკის კოდები</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="short-code">
              მოკლე კოდი
            </label>
            <Input
              autoFocus
              id="short-code"
              name="short-code"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              placeholder="მაგ: TBIL1"
              className="h-14 text-base font-mono tracking-widest uppercase bg-card border-border"
              disabled={loading}
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="access-code">
              წვდომის კოდი
            </label>
            <Input
              id="access-code"
              name="access-code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="••••••••"
              className="h-14 text-base font-mono bg-card border-border"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          {error && (
            <p className="text-sm text-center text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={!shortCode || !accessCode || loading}
            className="w-full h-14 text-base font-semibold rounded-xl bg-primary text-primary-foreground disabled:opacity-30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 rounded-full animate-spin border-primary-foreground/30 border-t-primary-foreground" />
                გააქტიურება...
              </span>
            ) : (
              "კიოსკის გააქტიურება"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
