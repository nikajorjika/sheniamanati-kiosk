"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PackageX, AlertCircle } from "lucide-react";

interface WaitingScreenProps {
  packageCount: number;
  trackingNumbers: string[];
  requestId: string | null;
  onDone: () => void;
}

export function WaitingScreen({ packageCount, trackingNumbers, requestId, onDone }: WaitingScreenProps) {
  const [rejected, setRejected] = useState(false);
  const [received, setReceived] = useState(false);

  useEffect(() => {
    if (packageCount === 0) {
      const t = setTimeout(onDone, 5_000);
      return () => clearTimeout(t);
    }

    if (!requestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/client/pickup-status/${requestId}`);
        const data = await res.json();
        if (data.received) {
          clearInterval(interval);
          setReceived(true);
        } else if (data.rejected) {
          clearInterval(interval);
          setRejected(true);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3_000);

    return () => clearInterval(interval);
  }, [packageCount, requestId, onDone]);

  // Auto-dismiss success screen after showing success message briefly
  useEffect(() => {
    if (!received) return;
    const t = setTimeout(onDone, 3_000);
    return () => clearTimeout(t);
  }, [received, onDone]);

  // Auto-dismiss rejection screen after 15 seconds
  useEffect(() => {
    if (!rejected) return;
    const t = setTimeout(onDone, 15_000);
    return () => clearTimeout(t);
  }, [rejected, onDone]);

  if (rejected) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-background">
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-destructive/10 blur-[60px]" />
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-16 w-16 text-destructive" strokeWidth={1.5} />
          </div>
        </div>

        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            მოთხოვნა უარყოფილია
          </h1>
          <p className="text-xl text-muted-foreground">
            დამატებითი ინფორმაციისთვის გთხოვთ მიმართოთ მოლარეს
          </p>
        </div>
      </div>
    );
  }

  if (packageCount === 0) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-background">
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-muted/20 blur-[60px]" />
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-border bg-card">
            <PackageX className="h-16 w-16 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>

        <div className="max-w-sm space-y-3 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            ამანათი არ მოიძებნა
          </h1>
          <p className="text-xl text-muted-foreground">
            გადახდილი ამანათი არ გაქვთ — გთხოვთ, მოგვიანებით სცადოთ
          </p>
        </div>
      </div>
    );
  }

  // Success message after warehouse marks received
  if (received) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-background">
        {/* Success glow + icon */}
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-success/10 blur-[60px]" />
          <div className="flex h-32 w-32 items-center justify-center rounded-full border border-success/30 bg-success/10">
            <CheckCircle2 className="h-16 w-16 text-success" strokeWidth={1.5} />
          </div>
        </div>

        {/* Message */}
        <div className="max-w-sm space-y-3 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            ✓ თქვენი მიწოდება მოხდა!
          </h1>
          <p className="text-xl text-muted-foreground">
            თქვენი{" "}
            <span className="font-bold text-foreground">{packageCount}</span>{" "}
            {packageCount === 1 ? "ამანათი" : "ამანათი"} მზად არის — გთხოვთ, აიყარეთ
          </p>
        </div>
      </div>
    );
  }

  // Waiting screen
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-10 bg-background">
      {/* Waiting icon */}
      <div className="relative flex items-center justify-center">
        <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-amber-500/10 blur-[60px]" />
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/10">
          <CheckCircle2 className="h-16 w-16 text-amber-500" strokeWidth={1.5} />
        </div>
      </div>

      {/* Message */}
      <div className="max-w-sm space-y-3 text-center">
        <h1 className="text-3xl font-bold text-foreground">
          მოთხოვნა მიღებულია
        </h1>
        <p className="text-xl text-muted-foreground">
          თქვენი{" "}
          <span className="font-bold text-foreground">{packageCount}</span>{" "}
          {packageCount === 1 ? "ამანათი" : "ამანათი"} მზადდება — გთხოვთ, დაიცადოთ
        </p>
      </div>

      {/* Tracking numbers */}
      {trackingNumbers.length > 0 && (
        <div className="flex flex-col items-center gap-2">
          {trackingNumbers.map((tn) => (
            <span
              key={tn}
              className="rounded-lg border border-border bg-card px-4 py-2 font-mono text-sm text-muted-foreground"
            >
              {tn}
            </span>
          ))}
        </div>
      )}

      {/* Pulsing dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500/60"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
