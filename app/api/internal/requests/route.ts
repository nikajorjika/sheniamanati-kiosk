import { NextResponse } from "next/server";

export interface PickupRequest {
  id: string;
  clientName: string;
  trackingNumber: string;
  roomNumber: string;
  createdAt: string; // ISO string
}

// TODO: Replace with real DB query
// GET /api/internal/requests
// Real response should fetch all active (not yet received) pickup requests from DB,
//   filtered by terminal/location if needed
export async function GET() {
  // Mock data — 3 active requests
  const requests: PickupRequest[] = [
    {
      id: "req-001",
      clientName: "გიორგი მამალაძე",
      trackingNumber: "GE123456789",
      roomNumber: "142857",
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: "req-002",
      clientName: "მარიამ ჯაფარიძე",
      trackingNumber: "GE987654321",
      roomNumber: "271828",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: "req-003",
      clientName: "დავით კვარაცხელია",
      trackingNumber: "GE555000111",
      roomNumber: "314159",
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({ requests });
}
