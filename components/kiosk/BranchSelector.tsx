"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export interface Branch {
  id: number;
  name: string;
}

interface BranchSelectorProps {
  onSelect: (branch: Branch) => void;
}

export function BranchSelector({ onSelect }: BranchSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/kiosk/branches")
      .then((r) => r.json())
      .then((data) => setBranches(data.branches ?? []))
      .catch(() => setError("ფილიალების ჩატვირთვა ვერ მოხდა"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-between bg-background py-10 px-8">
      <div className="text-center">
        <p className="text-sm font-medium tracking-widest uppercase text-primary mb-2">
          ერთჯერადი დაყენება · ნაბიჯი 1 / 2
        </p>
        <h1 className="text-3xl font-bold text-foreground">აირჩიეთ ფილიალი</h1>
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
        ) : (
          branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => onSelect(branch)}
              className="flex items-center justify-center rounded-xl border border-border bg-card px-6 py-5 text-lg font-semibold text-foreground transition-all touch-manipulation active:scale-95 active:bg-primary/10 active:border-primary/50 hover:bg-secondary"
            >
              {branch.name}
            </button>
          ))
        )}
      </div>

      <div />
    </div>
  );
}
