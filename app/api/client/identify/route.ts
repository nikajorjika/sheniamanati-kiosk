import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real backend call
// POST /api/client/identify
// Body: { tabletId: string; roomNumber: string }
// Real response should: validate roomNumber against DB, check for unpaid parcels,
//   trigger SMS to the customer's phone, return masked phone number
export async function POST(req: NextRequest) {
  const { roomNumber } = await req.json();

  // Mock: any 6-digit number is valid
  if (!roomNumber || String(roomNumber).length !== 6) {
    return NextResponse.json(
      { valid: false, error: "ოთახის ნომერი არასწორია" },
      { status: 400 }
    );
  }

  // TODO: check against real DB for room existence and unpaid balance

  return NextResponse.json({
    valid: true,
    phoneLastThree: "23", // last digits of the masked phone number
  });
}
