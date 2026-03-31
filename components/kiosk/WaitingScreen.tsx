"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PackageX, AlertCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// After this many ms without fulfillment, show the cancel button
const CANCEL_AFTER_MS = 10 * 60 * 1000; // 10 minutes

interface WaitingScreenProps {
  packageCount: number;
  trackingNumbers: string[];
  requestId: string | null;
  onDone: () => void;
}

export function WaitingScreen({
  packageCount,
  trackingNumbers,
  requestId,
  onDone,
}: WaitingScreenProps) {
  const [rejected, setRejected] = useState(false);
  const [received, setReceived] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const [receivedCount, setReceivedCount] = useState(0);
  const [receivedTrackingNumbers, setReceivedTrackingNumbers] = useState<string[]>([]);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Poll for status updates
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
          setReceivedCount(data.received_count ?? 0);
          setReceivedTrackingNumbers(data.received_tracking_numbers ?? []);
          setReceived(true);
        } else if (data.rejected) {
          clearInterval(interval);
          setRejected(true);
        } else if (data.cancelled) {
          clearInterval(interval);
          setCancelled(true);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 3_000);

    return () => clearInterval(interval);
  }, [packageCount, requestId, onDone]);

  // Show cancel button after timeout
  useEffect(() => {
    if (!requestId || packageCount === 0) return;
    const t = setTimeout(() => setShowCancel(true), CANCEL_AFTER_MS);
    return () => clearTimeout(t);
  }, [requestId, packageCount]);

  // Auto-dismiss terminal states after 20 seconds
  useEffect(() => {
    if (!received) return;
    const t = setTimeout(onDone, 20_000);
    return () => clearTimeout(t);
  }, [received, onDone]);

  useEffect(() => {
    if (!rejected) return;
    const t = setTimeout(onDone, 20_000);
    return () => clearTimeout(t);
  }, [rejected, onDone]);

  useEffect(() => {
    if (!cancelled) return;
    const t = setTimeout(onDone, 10_000);
    return () => clearTimeout(t);
  }, [cancelled, onDone]);

  async function handleCancel() {
    if (!requestId || cancelling) return;
    setCancelling(true);
    try {
      await fetch(`/api/client/cancel-request/${requestId}`, { method: "POST" });
    } catch {
      // even on network error — treat as cancelled locally
    }
    setCancelled(true);
  }

  if (rejected) {
    return (
      <div
        onClick={onDone}
        onTouchStart={onDone}
        className="flex flex-col items-center justify-center w-screen h-screen gap-10 cursor-pointer bg-background"
      >
        <div className="relative flex items-center justify-center">
          <div
            className="pointer-events-none absolute h-48 w-48 rounded-full blur-[60px]"
            style={{ background: "color-mix(in oklch, var(--color-destructive) 10%, transparent)" }}
          />
          <div
            className="flex items-center justify-center w-32 h-32 rounded-full bg-destructive-subtle"
            style={{ boxShadow: "0 0 40px var(--destructive-glow)" }}
          >
            <AlertCircle className="w-16 h-16 text-destructive" strokeWidth={1.5} />
          </div>
        </div>
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            მოთხოვნა უარყოფილია
          </h1>
          <p className="text-xl text-muted-foreground">
            დამატებითი ინფორმაციისთვის გთხოვთ მიმართოთ მოლარეს
          </p>
        </div>
      </div>
    );
  }

  if (cancelled) {
    return (
      <div
        onClick={onDone}
        onTouchStart={onDone}
        className="flex flex-col items-center justify-center w-screen h-screen gap-10 cursor-pointer bg-background"
      >
        <div className="relative flex items-center justify-center">
          <div
            className="pointer-events-none absolute h-48 w-48 rounded-full blur-[60px]"
            style={{ background: "color-mix(in oklch, var(--color-muted-foreground) 10%, transparent)" }}
          />
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-muted">
            <XCircle className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            მოთხოვნა გაუქმდა
          </h1>
          <p className="text-xl text-muted-foreground">
            თქვენი მოთხოვნა გაუქმებულია. საჭიროების შემთხვევაში სცადეთ ხელახლა.
          </p>
        </div>
      </div>
    );
  }

  if (packageCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen gap-10 bg-background">
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute h-48 w-48 rounded-full bg-muted/40 blur-[60px]" />
          <div className="flex items-center justify-center w-32 h-32 rounded-full bg-surface-container-highest">
            <PackageX className="w-16 h-16 text-muted-foreground" strokeWidth={1.5} />
          </div>
        </div>
        <div className="max-w-sm space-y-3 text-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            ამანათი ვერ მოიძებნა
          </h1>
          <p className="text-xl text-muted-foreground">
            გადასახდელი ამანათი არ გაქვს — გთხოვთ, მოგვიანებით სცადოთ
          </p>
        </div>
      </div>
    );
  }

  if (received) {
    return (
      <div
        onClick={onDone}
        onTouchStart={onDone}
        className="flex flex-col items-center justify-center w-screen h-screen gap-10 cursor-pointer bg-background"
      >
        <div className="relative flex items-center justify-center">
          <div
            className="pointer-events-none absolute h-48 w-48 rounded-full blur-[60px]"
            style={{ background: "color-mix(in oklch, var(--color-success) 10%, transparent)" }}
          />
          <div
            className="flex items-center justify-center w-32 h-32 rounded-full bg-success/10"
            style={{ boxShadow: "0 0 40px var(--success-glow)" }}
          >
            <CheckCircle2 className="w-16 h-16 text-success" strokeWidth={1.5} />
          </div>
        </div>
        <div className="max-w-sm space-y-3 text-center">
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            თქვენი ამანათი მზად არის!
          </h1>
          <p className="text-xl text-muted-foreground">
            თქვენი{" "}
            <span className="font-bold text-foreground">{receivedCount}</span>{" "}
            ამანათი მზად არის — გთხოვთ, აიღეთ
          </p>
        </div>
        {receivedTrackingNumbers.length > 0 && (
          <div className="flex flex-row flex-wrap justify-center gap-2">
            {receivedTrackingNumbers.map((tn) => (
              <span key={tn} className="px-4 py-2 font-mono text-sm rounded-lg bg-surface-container-highest text-muted-foreground">
                {tn}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Waiting state ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen gap-10 bg-background">
      <div className="relative flex items-center justify-center">
        <div
          className="pointer-events-none absolute h-48 w-48 rounded-full blur-[60px]"
          style={{ background: "color-mix(in oklch, var(--color-primary) 8%, transparent)" }}
        />
        <div
          className="flex items-center justify-center w-32 h-32 rounded-full bg-secondary-container"
          style={{ boxShadow: "0 0 40px var(--primary-glow)" }}
        >
          <CheckCircle2 className="w-16 h-16 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="max-w-sm space-y-3 text-center">
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
          მოთხოვნა მიღებულია
        </h1>
        <p className="text-xl text-muted-foreground">
          თქვენი{" "}
          <span className="font-bold text-foreground">{packageCount}</span>{" "}
          ამანათი მზადდება. გთხოვთ, დაიცადოთ და არ დატოვოთ კიოსკი
        </p>
      </div>

      {trackingNumbers.length > 0 && (
        <div className="flex flex-row flex-wrap justify-center gap-2">
          {trackingNumbers.map((tn) => (
            <span key={tn} className="px-4 py-2 font-mono text-sm rounded-lg bg-surface-container-highest text-muted-foreground">
              {tn}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary/50"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>

      {showCancel && (
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={cancelling}
          className="mt-2 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
        >
          {cancelling ? "გაუქმება..." : "მოთხოვნის გაუქმება"}
        </Button>
      )}
    </div>
  );
}
