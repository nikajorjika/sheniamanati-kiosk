import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export interface PickupRequest {
  id: string;
  client_name: string;
  room_number: string;
  tracking_numbers: string[];
  kiosk_number: string;
  created_at: string;
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization") ?? "";
  const branchId = req.nextUrl.searchParams.get("branch_id");

  const url = new URL(`${API_URL}/api/internal/requests`);
  if (branchId) url.searchParams.set("branch_id", branchId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: authorization, Accept: "application/json" },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
