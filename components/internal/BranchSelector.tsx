"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Building2, ChevronRight } from "lucide-react";
import type { Branch } from "@/components/kiosk/BranchSelector";

interface InternalBranchSelectorProps {
  onSelect: (branch: Branch) => void;
}

export function InternalBranchSelector({ onSelect }: InternalBranchSelectorProps) {
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
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-background px-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">ფილიალის არჩევა</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            აირჩიეთ თქვენი სამუშაო ფილიალი
          </p>
        </div>

        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {branches.map((branch) => (
              <button
                key={branch.id}
                onClick={() => onSelect(branch)}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-5 py-4 text-left transition-colors hover:bg-secondary hover:border-primary/30 group"
              >
                <span className="font-medium text-foreground">{branch.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
