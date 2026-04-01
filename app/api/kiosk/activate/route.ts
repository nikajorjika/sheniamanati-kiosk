import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost";

export async function POST(req: NextRequest) {
  const { short_code, access_code } = await req.json();

  const res = await fetch(`${API_URL}/api/kiosk/activate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ short_code, access_code }),
  });

  const data = await res.json();

  if (!data.success) {
    return NextResponse.json(
      { success: false, error: data.error },
      { status: res.status }
    );
  }

  return NextResponse.json({
    success: true,
    token: data.token,
    terminal_id: data.terminal_id,
    terminal_number: data.terminal_number,
    terminal_name: data.terminal_name,
    terminal_type: data.terminal_type,
    branch_id: data.branch_id,
    branch_name: data.branch_name,
  });
}
