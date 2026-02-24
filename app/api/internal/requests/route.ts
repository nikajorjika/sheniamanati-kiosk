import { NextResponse } from "next/server";

export interface PickupRequest {
  id: string;
  clientName: string;
  trackingNumbers: string[];
  roomNumber: string;
  createdAt: string; // ISO string
}

// TODO: Replace with real DB query
// GET /api/internal/requests
// Real response should fetch all active (not yet received) pickup requests from DB,
//   filtered by terminal/location if needed
export async function GET() {
  // Mock data — 3 active requests (demonstrating multiple packages per guest)
  const requests: PickupRequest[] = [
    {
      id: "req-001",
      clientName: "გიორგი მამალაძე",
      trackingNumbers: ["GE123456789", "GE987654321", "GE555000111"],
      roomNumber: "142857",
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    },
    {
      id: "req-002",
      clientName: "მარიამ ჯაფარიძე",
      trackingNumbers: ["GE444333222"],
      roomNumber: "271828",
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: "req-003",
      clientName: "დავით კვარაცხელია",
      trackingNumbers: ["GE111222333", "GE999888777"],
      roomNumber: "314159",
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    },
  ];

  return NextResponse.json({ requests });
}
