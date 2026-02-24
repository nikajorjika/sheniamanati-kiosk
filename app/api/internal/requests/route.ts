import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export interface PickupRequest {
  id: string;
  clientName: string;
  trackingNumbers: string[];
  roomNumber: string;
  kioskNumber: string;
  createdAt: string; // ISO string
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization") ?? "";
  const branchId = req.nextUrl.searchParams.get("branch_id");

  const url = new URL(`${API_URL}/api/internal/requests`);
  if (branchId) url.searchParams.set("branch_id", branchId);

  const res = await fetch(url.toString(), {
    headers: { Authorization: authorization },
  });

  const data = await res.json();

  const requests: PickupRequest[] = (data.data ?? []).map(
    (item: {
      id: string;
      client_name: string;
      room_number: string;
      tracking_numbers: string[];
      kiosk_number: string;
      created_at: string;
    }) => ({
      id: item.id,
      clientName: item.client_name,
      roomNumber: item.room_number,
      trackingNumbers: item.tracking_numbers,
      kioskNumber: item.kiosk_number ?? "",
      createdAt: item.created_at,
    })
  );

  return NextResponse.json({ requests });
}
