import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function POST(req: NextRequest) {
  const { tabletId, roomNumber, otp } = await req.json();

  const res = await fetch(`${API_URL}/api/client/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tablet_id: tabletId, room_number: roomNumber, otp }),
  });

  const data = await res.json();

  if (!data.valid) {
    return NextResponse.json({ valid: false, error: data.error }, { status: res.status });
  }

  return NextResponse.json({
    valid: true,
    package_count: data.package_count,
    tracking_numbers: data.tracking_numbers,
    request_id: data.request_id,
  });
}
