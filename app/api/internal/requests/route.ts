import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export interface PickupRequest {
  id: string;
  clientName: string;
  trackingNumbers: string[];
  roomNumber: string;
  createdAt: string; // ISO string
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization") ?? "";

  const res = await fetch(`${API_URL}/api/internal/requests`, {
    headers: { Authorization: authorization },
  });

  const data = await res.json();

  const requests: PickupRequest[] = (data.data ?? []).map(
    (item: {
      id: string;
      client_name: string;
      room_number: string;
      tracking_numbers: string[];
      created_at: string;
    }) => ({
      id: item.id,
      clientName: item.client_name,
      roomNumber: item.room_number,
      trackingNumbers: item.tracking_numbers,
      createdAt: item.created_at,
    })
  );

  return NextResponse.json({ requests });
}
