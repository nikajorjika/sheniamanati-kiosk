import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const res = await fetch(`${API_URL}/api/client/pickup-status/${id}`);
    const data = await res.json();
    return NextResponse.json({
      received: data.received ?? false,
      rejected: data.rejected ?? false,
      received_count: data.received_count ?? null,
      received_tracking_numbers: data.received_tracking_numbers ?? null,
      marked_by_terminal_id: data.marked_by_terminal_id ?? null,
      marked_at: data.marked_at ?? null,
      rejected_by_terminal_id: data.rejected_by_terminal_id ?? null,
      rejected_at: data.rejected_at ?? null,
    });
  } catch {
    return NextResponse.json({ received: false, rejected: false }, { status: 200 });
  }
}
