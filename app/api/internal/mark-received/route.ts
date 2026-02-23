import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real backend call
// POST /api/internal/mark-received
// Body: { id: string }
// Real response should: update request status in DB to "received",
//   potentially notify client-facing system, log timestamp and employee ID
export async function POST(req: NextRequest) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
  }

  // TODO: mark request as received in DB

  return NextResponse.json({ success: true });
}
