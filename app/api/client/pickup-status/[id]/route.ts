import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${API_URL}/api/client/pickup-status/${id}`);
  const data = await res.json();

  return NextResponse.json({ received: data.received ?? false });
}
