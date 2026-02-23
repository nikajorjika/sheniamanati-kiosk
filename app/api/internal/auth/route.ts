import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real authentication
// POST /api/internal/auth
// Body: { username: string; password: string }
// Real response should return a session token or set an httpOnly cookie
export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  // Mock credentials — replace with real auth
  if (username === "admin" && password === "admin123") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { success: false, error: "მომხმარებლის სახელი ან პაროლი არასწორია" },
    { status: 401 }
  );
}
