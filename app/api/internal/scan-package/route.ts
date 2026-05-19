import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export type ScanResultStatus =
  | "received"
  | "already_received"
  | "no_pending_request"
  | "not_found";

export interface ScanPackageResponse {
  status: ScanResultStatus;
  tracking_number: string;
  request_id?: string;
  client_name?: string | null;
  room_number?: string | null;
  request_completed?: boolean;
  remaining?: string[];
}

export async function POST(req: NextRequest) {
  const { tracking_number } = await req.json();
  const authorization = req.headers.get("Authorization") ?? "";

  if (!tracking_number || typeof tracking_number !== "string") {
    return NextResponse.json(
      { success: false, error: "tracking_number is required" },
      { status: 400 },
    );
  }

  const res = await fetch(`${API_URL}/api/internal/scan-package`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify({ tracking_number }),
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
