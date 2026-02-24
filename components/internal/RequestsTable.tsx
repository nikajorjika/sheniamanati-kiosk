"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Package, RefreshCw, LogOut, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PickupRequest } from "@/app/api/internal/requests/route";
import type { Branch } from "@/components/kiosk/BranchSelector";

interface RequestsTableProps {
  token: string;
  branch: Branch;
  onChangeBranch: () => void;
  onLogout: () => void;
}

const POLL_INTERVAL = 10_000; // 10 seconds

export function RequestsTable({ token, branch, onChangeBranch, onLogout }: RequestsTableProps) {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // selectedByRequest: when a key is absent, all packages for that request are selected
  const [selectedByRequest, setSelectedByRequest] = useState<Record<string, string[]>>({});

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`/api/internal/requests?branch_id=${branch.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests(data.requests ?? []);
      setLastUpdated(new Date());
    } catch {
      // silently fail on poll — data stays stale
    } finally {
      setLoading(false);
    }
  }, [token, branch.id]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  function getSelected(req: PickupRequest): string[] {
    return selectedByRequest[req.id] ?? req.trackingNumbers;
  }

  function toggleTracking(req: PickupRequest, trackingNumber: string) {
    setSelectedByRequest((prev) => {
      const current = prev[req.id] ?? req.trackingNumbers;
      const next = current.includes(trackingNumber)
        ? current.filter((tn) => tn !== trackingNumber)
        : [...current, trackingNumber];
      return { ...prev, [req.id]: next };
    });
  }

  async function handleMarkReceived(req: PickupRequest) {
    const selected = getSelected(req);
    if (selected.length === 0) return;

    setMarkingId(req.id);
    try {
      await fetch("/api/internal/mark-received", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: req.id, tracking_numbers: selected }),
      });
      // Optimistically remove from list
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      setSelectedByRequest((prev) => {
        const next = { ...prev };
        delete next[req.id];
        return next;
      });
    } finally {
      setMarkingId(null);
    }
  }

  function formatTime(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diff < 1) return "ახლახანს";
    if (diff === 1) return "1 წუთის წინ";
    return `${diff} წუთის წინ`;
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-8 py-5">
        <div className="flex items-center gap-3">
          <Package className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-foreground">აქტიური მოთხოვნები</h1>
          <Badge variant="outline" className="text-muted-foreground font-normal">
            {branch.name}
          </Badge>
          {requests.length > 0 && (
            <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold">
              {requests.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              განახლდა: {lastUpdated.toLocaleTimeString("ka-GE")}
            </span>
          )}
          <Button
            onClick={fetchRequests}
            variant="outline"
            size="icon"
            className="h-9 w-9 border-border"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={onChangeBranch}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            ფილიალი
          </Button>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            გასვლა
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <CheckCircle2 className="h-16 w-16 text-success/50" strokeWidth={1.5} />
            <p className="text-xl font-semibold text-muted-foreground">
              აქტიური მოთხოვნა არ არის
            </p>
            <p className="text-sm text-muted-foreground">
              ახალი მოთხოვნები ავტომატურად გამოჩნდება
            </p>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                {["კლიენტი", "კიოსკი", "ტრეკინგ ნომერი", "ოთახის ნომ.", "დრო", ""].map((h) => (
                  <th
                    key={h}
                    className="pb-3 text-left text-xs font-medium tracking-wider uppercase text-muted-foreground first:pl-0 last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req) => {
                const selected = getSelected(req);
                const noneSelected = selected.length === 0;
                return (
                  <tr
                    key={req.id}
                    className="group transition-colors hover:bg-secondary/40"
                  >
                    <td className="py-4 pr-4 text-base font-medium text-foreground">
                      {req.clientName}
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm font-semibold text-primary">
                      #{req.kioskNumber}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-1.5">
                        {req.trackingNumbers.map((tn) => {
                          const checked = selected.includes(tn);
                          return (
                            <label
                              key={tn}
                              className="flex cursor-pointer items-center gap-2 group/tn"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleTracking(req, tn)}
                                className="h-4 w-4 cursor-pointer accent-primary"
                              />
                              <span
                                className={`font-mono text-sm transition-colors ${
                                  checked
                                    ? "text-muted-foreground"
                                    : "text-muted-foreground/40 line-through"
                                }`}
                              >
                                {tn}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-4 pr-4 font-mono text-sm font-semibold text-primary">
                      {req.roomNumber}
                    </td>
                    <td className="py-4 pr-4 text-sm text-muted-foreground">
                      {formatTime(req.createdAt)}
                    </td>
                    <td className="py-4 text-right">
                      <Button
                        onClick={() => handleMarkReceived(req)}
                        disabled={markingId === req.id || noneSelected}
                        size="sm"
                        className="gap-2 bg-success/15 text-success border border-success/30 hover:bg-success/25 hover:text-success font-semibold disabled:opacity-40"
                        variant="ghost"
                      >
                        {markingId === req.id ? (
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-success/30 border-t-success" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                        მიღებულია
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
