import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ branchId: string }> }
) {
  const { branchId } = await params;
  const res = await fetch(`${API_URL}/api/kiosk/branches/${branchId}/terminals`);
  const data = await res.json();

  return NextResponse.json({ terminals: data.data ?? [] });
}
