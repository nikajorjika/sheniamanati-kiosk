import { NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function GET() {
  const res = await fetch(`${API_URL}/api/kiosk/branches`, {
    headers: { "Accept": "application/json" },
  });
  const data = await res.json();

  return NextResponse.json({ branches: data.data ?? [] });
}
