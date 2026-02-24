import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const res = await fetch(`${API_URL}/api/internal/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  if (!data.success) {
    return NextResponse.json(
      { success: false, error: data.error },
      { status: res.status }
    );
  }

  return NextResponse.json({ success: true, token: data.token });
}
