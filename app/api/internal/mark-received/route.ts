import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function POST(req: NextRequest) {
  const { id, tracking_numbers } = await req.json();
  const authorization = req.headers.get("Authorization") ?? "";

  if (!id) {
    return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
  }

  const body: { id: string; tracking_numbers?: string[] } = { id };
  if (Array.isArray(tracking_numbers)) {
    body.tracking_numbers = tracking_numbers;
  }

  const res = await fetch(`${API_URL}/api/internal/mark-received`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
