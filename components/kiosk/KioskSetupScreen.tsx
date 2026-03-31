"use client";

import { useState } from "react";
import { RotateCcw, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <KioskShell>
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-md shadow-[0_8px_40px_var(--primary-glow)]">
          <CardContent className="pt-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Short code */}
              <div className="space-y-2">
                <Label htmlFor="short-code" className="text-sm font-semibold">
                  ფილიალის კოდი
                </Label>
                <Input
                  autoFocus
                  id="short-code"
                  value={shortCode}
                  onChange={(e) => setShortCode(e.target.value)}
                  placeholder="მაგ: TBS01"
                  className="h-14 text-base font-mono tracking-widest uppercase"
                  disabled={loading}
                  autoComplete="off"
                  autoCapitalize="characters"
                />
              </div>

              {/* Access code */}
              <div className="space-y-2">
                <Label htmlFor="access-code" className="text-sm font-semibold">
                  წვდომის კოდი
                </Label>
                <Input
                  id="access-code"
                  type="password"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 text-base font-mono"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 rounded-xl bg-destructive/8 px-4 py-3">
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
                className="w-full h-14 text-base font-semibold gap-3"
              >
                {loading ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    მიმდინარეობს...
                  </>
                ) : (
                  <>
                    ავტორიზაცია
                    <Wifi className="h-4 w-4 opacity-60" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </KioskShell>
  );
}
