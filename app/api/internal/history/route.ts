import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export interface HistoryItem {
  id: string;
  client_name: string;
  room_number: string;
  status: "received" | "rejected";
  tracking_numbers: string[];
  /** Subset of tracking_numbers whose Package.status is `received`. `[]` for rejected requests. */
  received_tracking_numbers: string[];
  /** Terminal number that CREATED the request. */
  kiosk_number: string;
  /** Terminal number that finalized (marked/rejected) the request; may be null. */
  actioned_by_kiosk_number: string | null;
  /** ISO 8601 — marked_at (received) or rejected_at (rejected). Null only if neither timestamp is set. */
  actioned_at: string | null;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization") ?? "";
  const branchId = req.nextUrl.searchParams.get("branch_id");

  const url = new URL(`${API_URL}/api/internal/history`);
  if (branchId) url.searchParams.set("branch_id", branchId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: authorization, Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
