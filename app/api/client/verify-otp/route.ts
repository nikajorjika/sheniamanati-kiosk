import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real backend call
// POST /api/client/verify-otp
// Body: { tabletId: string; roomNumber: string; otp: string }
// Real response should: validate OTP against the one sent via SMS,
//   create a pickup request record, and notify internal tablet
export async function POST(req: NextRequest) {
  const { otp } = await req.json();

  // Mock: any 6-digit code is accepted
  if (!otp || String(otp).length !== 6) {
    return NextResponse.json(
      { valid: false, error: "კოდი არასწორია" },
      { status: 400 }
    );
  }

  // TODO: validate OTP against sent code, create pickup request
  // TODO: push new request to internal tablet (SSE / WebSocket / polling)

  return NextResponse.json({ valid: true });
}
