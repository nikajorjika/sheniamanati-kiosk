"use client";

import { useState } from "react";
import { LoginScreen } from "@/components/internal/LoginScreen";
import { RequestsTable } from "@/components/internal/RequestsTable";

type InternalScreen = "login" | "dashboard";

export default function InternalApp() {
  const [screen, setScreen] = useState<InternalScreen>("login");

  async function handleLogin(
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    // TODO: POST /api/internal/auth { username, password }
    // Add session token handling (httpOnly cookie or localStorage) when real auth is implemented
    const res = await fetch("/api/internal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      setScreen("dashboard");
      return { success: true };
    }
    return { success: false, error: data.error };
  }

  function handleLogout() {
    // TODO: clear session token when real auth is implemented
    setScreen("login");
  }

  switch (screen) {
    case "login":
      return <LoginScreen onLogin={handleLogin} />;
    case "dashboard":
      return <RequestsTable onLogout={handleLogout} />;
  }
}
