"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { Branch } from "./BranchSelector";

export interface Terminal {
  id: number;
  number: string;
  name: string | null;
}

interface TerminalSelectorProps {
  branch: Branch;
  onSelect: (terminal: Terminal) => void;
  onBack: () => void;
}

export function TerminalSelector({ branch, onSelect, onBack }: TerminalSelectorProps) {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/kiosk/branches/${branch.id}/terminals`)
      .then((r) => r.json())
      .then((data) => setTerminals(data.terminals ?? []))
      .catch(() => setError("ტერმინალების ჩატვირთვა ვერ მოხდა"))
      .finally(() => setLoading(false));
  }, [branch.id]);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-between bg-background py-10 px-8">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">უკან</span>
        </button>
        <div className="text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">
            {branch.name} · ნაბიჯი 2 / 2
          </p>
          <h1 className="text-3xl font-bold text-foreground">აირჩიეთ ტერმინალი</h1>
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-destructive justify-center">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ) : terminals.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">
            ამ ფილიალს ტერმინალი არ აქვს
          </p>
        ) : (
          terminals.map((terminal) => (
            <button
              key={terminal.id}
              onClick={() => onSelect(terminal)}
              className="flex items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-5 text-lg font-semibold text-foreground transition-all touch-manipulation active:scale-95 active:bg-primary/10 active:border-primary/50 hover:bg-secondary"
            >
              <span className="font-mono text-2xl">{terminal.number}</span>
              {terminal.name && (
                <span className="text-sm text-muted-foreground font-normal">
                  {terminal.name}
                </span>
              )}
            </button>
          ))
        )}
      </div>

      <div />
    </div>
  );
}
