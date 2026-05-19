"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Inbox,
  ListChecks,
  Loader2,
  LogOut,
  Package as PackageIcon,
  RefreshCw,
  ScanLine,
  Table as TableIcon,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Branch } from "@/components/kiosk/BranchSelector";
import type { PickupRequest } from "@/app/api/internal/requests/route";
import type {
  ScanPackageResponse,
  ScanResultStatus,
} from "@/app/api/internal/scan-package/route";

interface ScanPanelProps {
  token: string;
  branch: Branch;
  onLogout: () => void;
}

interface ScanEntry {
  id: number;
  trackingNumber: string;
  status: ScanResultStatus | "error";
  clientName?: string | null;
  roomNumber?: string | null;
  requestCompleted?: boolean;
  remaining?: string[];
  scannedAt: Date;
}

type Tab = "requests" | "history";

const STATUS_META: Record<
  ScanResultStatus | "error",
  { label: string; tone: "success" | "warning" | "destructive" }
> = {
  received: { label: "მიღებულია", tone: "success" },
  already_received: { label: "უკვე მიღებულია", tone: "warning" },
  no_pending_request: { label: "მოთხოვნა ვერ მოიძებნა", tone: "warning" },
  not_found: { label: "ამანათი ვერ მოიძებნა", tone: "destructive" },
  error: { label: "შეცდომა", tone: "destructive" },
};

const TONE_CLASSES: Record<"success" | "warning" | "destructive", string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-primary/15 text-primary border-primary/30",
  destructive: "bg-destructive/15 text-destructive border-destructive/30",
};

const TONE_ICON: Record<"success" | "warning" | "destructive", typeof CheckCircle2> = {
  success: CheckCircle2,
  warning: AlertCircle,
  destructive: XCircle,
};

const MAX_HISTORY = 25;
const POLL_INTERVAL = 10_000;

export function ScanPanel({ token, branch, onLogout }: ScanPanelProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [buffer, setBuffer] = useState("");
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<ScanEntry | null>(null);
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<PickupRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  // Tracking numbers received this session, keyed by request_id → set of TNs.
  // Merged on top of server-side received_tracking_numbers so optimistic
  // updates render green immediately, before the next poll.
  const [localReceived, setLocalReceived] = useState<Record<string, Set<string>>>({});
  // Briefly-highlighted tracking numbers (just scanned). Tracking-number key.
  const [flashing, setFlashing] = useState<Set<string>>(new Set());
  const entryIdRef = useRef(0);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch(`/api/internal/requests?branch_id=${branch.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onLogout();
        return;
      }
      const data = await res.json();
      setRequests(data.data ?? []);
      setLastUpdated(new Date());
    } catch {
      // poll silently — keep previous data
    } finally {
      setRequestsLoading(false);
    }
  }, [token, branch.id, onLogout]);

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const flash = useCallback((trackingNumber: string) => {
    setFlashing((prev) => {
      const next = new Set(prev);
      next.add(trackingNumber);
      return next;
    });
    window.setTimeout(() => {
      setFlashing((prev) => {
        if (!prev.has(trackingNumber)) return prev;
        const next = new Set(prev);
        next.delete(trackingNumber);
        return next;
      });
    }, 1500);
  }, []);

  const submitScan = useCallback(
    async (raw: string) => {
      const trackingNumber = raw.trim();
      if (!trackingNumber) return;

      setSubmitting(true);
      try {
        const res = await fetch("/api/internal/scan-package", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ tracking_number: trackingNumber }),
        });

        if (res.status === 401) {
          onLogout();
          return;
        }

        const data = (await res.json().catch(() => null)) as ScanPackageResponse | null;
        const status: ScanEntry["status"] = data?.status ?? "error";
        const resolvedTn = data?.tracking_number ?? trackingNumber;

        entryIdRef.current += 1;
        const entry: ScanEntry = {
          id: entryIdRef.current,
          trackingNumber: resolvedTn,
          status,
          clientName: data?.client_name ?? null,
          roomNumber: data?.room_number ?? null,
          requestCompleted: data?.request_completed,
          remaining: data?.remaining,
          scannedAt: new Date(),
        };
        setLastResult(entry);
        setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));

        if (status === "received" && data?.request_id) {
          const requestId = data.request_id;
          setLocalReceived((prev) => {
            const existing = prev[requestId] ?? new Set<string>();
            const next = new Set(existing);
            next.add(resolvedTn);
            return { ...prev, [requestId]: next };
          });
          flash(resolvedTn);

          if (data.request_completed) {
            // Drop the request optimistically; poll will reconcile.
            setRequests((prev) => prev.filter((r) => r.id !== requestId));
            setLocalReceived((prev) => {
              const next = { ...prev };
              delete next[requestId];
              return next;
            });
          }
        }
      } catch {
        entryIdRef.current += 1;
        const entry: ScanEntry = {
          id: entryIdRef.current,
          trackingNumber,
          status: "error",
          scannedAt: new Date(),
        };
        setLastResult(entry);
        setHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
      } finally {
        setSubmitting(false);
        setBuffer("");
        inputRef.current?.focus();
      }
    },
    [token, onLogout, flash],
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();

    function handleClick() {
      inputRef.current?.focus();
    }
    function handleVisibility() {
      if (!document.hidden) inputRef.current?.focus();
    }
    const container = containerRef.current;
    container?.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      container?.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const lastTone = lastResult ? STATUS_META[lastResult.status].tone : null;
  const LastIcon = lastTone ? TONE_ICON[lastTone] : ScanLine;

  const receivedSetFor = useCallback(
    (req: PickupRequest): Set<string> => {
      const server = req.received_tracking_numbers ?? [];
      const local = localReceived[req.id] ?? new Set<string>();
      return new Set<string>([...server, ...local]);
    },
    [localReceived],
  );

  const totals = useMemo(() => {
    let scanned = 0;
    let total = 0;
    for (const req of requests) {
      const received = receivedSetFor(req);
      total += req.tracking_numbers.length;
      scanned += received.size;
    }
    return { scanned, total };
  }, [requests, receivedSetFor]);

  function formatAge(iso: string) {
    const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    if (diff < 1) return "ახლახანს";
    if (diff === 1) return "1 წუთის წინ";
    return `${diff} წუთის წინ`;
  }

  return (
    <div ref={containerRef} className="flex flex-col w-screen h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b shadow-sm border-border bg-card shadow-foreground/5">
        <div className="flex items-center gap-3">
          <ScanLine className="w-6 h-6 text-primary" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-foreground">სკანირების რეჟიმი</h1>
          <Badge variant="outline" className="font-normal text-muted-foreground">
            {branch.name}
          </Badge>
          {totals.total > 0 && (
            <Badge className="font-semibold bg-primary/15 text-primary border-primary/30">
              {totals.scanned}/{totals.total}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/internal")}
            variant="outline"
            size="sm"
            className="gap-2 border-border"
          >
            <TableIcon className="w-4 h-4" />
            სიის ხედი
          </Button>
          <Button
            onClick={onLogout}
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            გასვლა
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_500px] overflow-hidden">
        {/* Scanner zone */}
        <div className="relative flex flex-col items-center justify-center p-12 overflow-hidden">
          <div className="absolute pointer-events-none -inset-12 bg-primary/10 blur-[80px]" />

          <div className="relative z-10 flex flex-col items-center w-full max-w-2xl gap-10 text-center">
            <div className="flex flex-col items-center gap-3">
              <ScanLine className="w-16 h-16 text-primary" strokeWidth={1.25} />
              <p className="text-sm tracking-widest uppercase text-primary">
                მზადაა სკანირებისთვის
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                გადაატარეთ შტრიხკოდი
              </h2>
              <p className="text-sm text-muted-foreground">
                ამანათი ავტომატურად აღინიშნება მიღებულად
              </p>
            </div>

            <input
              ref={inputRef}
              value={buffer}
              onChange={(e) => setBuffer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submitScan(buffer);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => inputRef.current?.focus(), 50);
              }}
              autoComplete="off"
              autoCapitalize="characters"
              inputMode="text"
              spellCheck={false}
              aria-label="შტრიხკოდის შესაყვანი ველი"
              className="font-mono text-2xl text-center bg-transparent outline-none w-72 text-foreground caret-primary"
              placeholder="—"
            />

            <div
              className={`flex items-center w-full gap-4 px-6 py-5 transition-all duration-300 border rounded-2xl ${
                lastResult && lastTone
                  ? TONE_CLASSES[lastTone]
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {submitting ? (
                <Loader2 className="w-8 h-8 shrink-0 animate-spin" />
              ) : (
                <LastIcon className="w-8 h-8 shrink-0" strokeWidth={1.5} />
              )}
              <div className="flex flex-col items-start flex-1 min-w-0 gap-1 text-left">
                {lastResult ? (
                  <>
                    <span className="text-lg font-semibold">
                      {STATUS_META[lastResult.status].label}
                    </span>
                    <span className="text-sm truncate opacity-80 font-mono">
                      {lastResult.trackingNumber}
                    </span>
                    {lastResult.clientName && (
                      <span className="text-xs opacity-70">
                        {lastResult.clientName}
                        {lastResult.roomNumber && ` · ოთახი ${lastResult.roomNumber}`}
                      </span>
                    )}
                    {lastResult.status === "received" &&
                      lastResult.requestCompleted && (
                        <span className="text-xs font-semibold tracking-wider uppercase">
                          მოთხოვნა დასრულდა
                        </span>
                      )}
                    {lastResult.status === "received" &&
                      !lastResult.requestCompleted &&
                      lastResult.remaining &&
                      lastResult.remaining.length > 0 && (
                        <span className="text-xs opacity-70">
                          დარჩა: {lastResult.remaining.length}
                        </span>
                      )}
                  </>
                ) : (
                  <span className="text-base">სკანირების შედეგი აქ გამოჩნდება</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex flex-col border-l bg-card border-border">
          {/* Tabs */}
          <div className="flex items-center justify-between px-4 pt-4 pb-0 border-b border-border">
            <div className="flex items-center gap-1">
              <TabButton
                active={tab === "requests"}
                onClick={() => setTab("requests")}
                icon={ListChecks}
                label="აქტიური მოთხოვნები"
                count={requests.length}
              />
              <TabButton
                active={tab === "history"}
                onClick={() => setTab("history")}
                icon={Clock}
                label="ისტორია"
                count={history.length}
              />
            </div>
            {tab === "requests" && (
              <button
                onClick={fetchRequests}
                aria-label="განახლება"
                className="flex items-center justify-center mb-2 transition-colors rounded h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            {tab === "history" && history.length > 0 && (
              <button
                onClick={() => {
                  setHistory([]);
                  inputRef.current?.focus();
                }}
                className="mb-2 text-xs transition-colors text-muted-foreground hover:text-foreground"
              >
                გასუფთავება
              </button>
            )}
          </div>

          {/* Tab content */}
          {tab === "requests" ? (
            <RequestsList
              loading={requestsLoading}
              requests={requests}
              receivedSetFor={receivedSetFor}
              flashing={flashing}
              formatAge={formatAge}
              lastUpdated={lastUpdated}
            />
          ) : (
            <HistoryList history={history} />
          )}
        </aside>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: typeof CheckCircle2;
  label: string;
  count?: number;
}

function TabButton({ active, onClick, icon: Icon, label, count }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors ${
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {typeof count === "number" && count > 0 && (
        <span
          className={`px-1.5 min-w-[20px] text-xs text-center rounded ${
            active
              ? "bg-primary/15 text-primary"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {count}
        </span>
      )}
      {active && (
        <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-primary" />
      )}
    </button>
  );
}

interface RequestsListProps {
  loading: boolean;
  requests: PickupRequest[];
  receivedSetFor: (req: PickupRequest) => Set<string>;
  flashing: Set<string>;
  formatAge: (iso: string) => string;
  lastUpdated: Date | null;
}

function RequestsList({
  loading,
  requests,
  receivedSetFor,
  flashing,
  formatAge,
  lastUpdated,
}: RequestsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1">
        <span className="w-8 h-8 border-2 rounded-full animate-spin border-border border-t-primary" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6 text-center text-muted-foreground">
        <Inbox className="w-10 h-10 opacity-40" strokeWidth={1.25} />
        <p className="text-sm font-medium">აქტიური მოთხოვნა არ არის</p>
        <p className="text-xs">ახალი მოთხოვნები ავტომატურად გამოჩნდება</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 px-3 py-3 overflow-auto">
        <ul className="flex flex-col gap-3">
          {requests.map((req) => {
            const received = receivedSetFor(req);
            const total = req.tracking_numbers.length;
            const done = received.size;
            const allDone = done === total && total > 0;
            return (
              <li
                key={req.id}
                className={`flex flex-col gap-3 px-4 py-3 border rounded-xl transition-colors ${
                  allDone
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate text-foreground">
                      {req.client_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ოთახი {req.room_number} · კიოსკი #{req.kiosk_number}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`px-2 py-0.5 text-xs font-mono font-semibold rounded ${
                        allDone
                          ? "bg-success/15 text-success"
                          : done > 0
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done}/{total}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatAge(req.created_at)}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-1">
                  {req.tracking_numbers.map((tn) => {
                    const isReceived = received.has(tn);
                    const isFlashing = flashing.has(tn);
                    return (
                      <li
                        key={tn}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-300 ${
                          isReceived
                            ? "bg-success/10 text-success"
                            : "text-muted-foreground"
                        } ${isFlashing ? "ring-2 ring-success/40" : ""}`}
                      >
                        {isReceived ? (
                          <CheckCircle2 className="w-4 h-4 shrink-0" strokeWidth={2} />
                        ) : (
                          <PackageIcon
                            className="w-4 h-4 shrink-0 opacity-50"
                            strokeWidth={1.5}
                          />
                        )}
                        <span
                          className={`font-mono text-sm truncate ${
                            isReceived ? "font-semibold" : ""
                          }`}
                        >
                          {tn}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
      {lastUpdated && (
        <div className="px-4 py-2 text-xs border-t border-border text-muted-foreground">
          განახლდა: {lastUpdated.toLocaleTimeString("ka-GE")}
        </div>
      )}
    </div>
  );
}

interface HistoryListProps {
  history: ScanEntry[];
}

function HistoryList({ history }: HistoryListProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-2 text-center text-muted-foreground">
        <ScanLine className="w-10 h-10 opacity-40" strokeWidth={1.25} />
        <p className="text-sm">სკანირებები ჯერ არ არის</p>
      </div>
    );
  }

  return (
    <div className="flex-1 px-3 py-3 overflow-auto">
      <ul className="flex flex-col gap-2">
        {history.map((entry) => {
          const tone = STATUS_META[entry.status].tone;
          const Icon = TONE_ICON[tone];
          return (
            <li
              key={entry.id}
              className={`flex items-start gap-3 px-3 py-2.5 border rounded-xl ${TONE_CLASSES[tone]}`}
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" strokeWidth={1.5} />
              <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <span className="font-mono text-sm font-semibold truncate">
                  {entry.trackingNumber}
                </span>
                <span className="text-xs opacity-80">
                  {STATUS_META[entry.status].label}
                  {entry.clientName ? ` · ${entry.clientName}` : ""}
                </span>
              </div>
              <span className="text-xs shrink-0 opacity-60">
                {entry.scannedAt.toLocaleTimeString("ka-GE", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
