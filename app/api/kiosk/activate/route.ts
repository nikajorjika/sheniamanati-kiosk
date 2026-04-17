import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const res = await fetch(`${API_URL}/api/kiosk/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
