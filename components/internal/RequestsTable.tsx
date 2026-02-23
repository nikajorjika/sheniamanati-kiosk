"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Package, RefreshCw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PickupRequest } from "@/app/api/internal/requests/route";

interface RequestsTableProps {
  onLogout: () => void;
}

const POLL_INTERVAL = 10_000; // 10 seconds

export function RequestsTable({ onLogout }: RequestsTableProps) {
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      // TODO: Replace with real endpoint + auth header
      const res = await fetch("/api/internal/requests");
      const data = await res.json();
      setRequests(data.requests ?? []);
      setLastUpdated(new Date());
    } catch {
      // silently fail on poll — data stays stale
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  async function handleMarkReceived(id: string) {
    setMarkingId(id);
    try {
      // TODO: Replace with real endpoint + auth header
      await fetch("/api/internal/mark-received", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      // Optimistically remove from list
      setRequests((prev) => prev.filter((r) => r.id !== id));
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
                {["კლიენტი", "ტრეკინგ ნომერი", "ოთახის ნომ.", "დრო", ""].map((h) => (
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
              {requests.map((req) => (
                <tr
                  key={req.id}
                  className="group transition-colors hover:bg-secondary/40"
                >
                  <td className="py-4 pr-4 text-base font-medium text-foreground">
                    {req.clientName}
                  </td>
                  <td className="py-4 pr-4 font-mono text-sm text-muted-foreground">
                    {req.trackingNumber}
                  </td>
                  <td className="py-4 pr-4 font-mono text-sm font-semibold text-primary">
                    {req.roomNumber}
                  </td>
                  <td className="py-4 pr-4 text-sm text-muted-foreground">
                    {formatTime(req.createdAt)}
                  </td>
                  <td className="py-4 text-right">
                    <Button
                      onClick={() => handleMarkReceived(req.id)}
                      disabled={markingId === req.id}
                      size="sm"
                      className="gap-2 bg-success/15 text-success border border-success/30 hover:bg-success/25 hover:text-success font-semibold"
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
