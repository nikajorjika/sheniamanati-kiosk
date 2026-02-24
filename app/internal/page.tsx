"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/internal/LoginScreen";
import { RequestsTable } from "@/components/internal/RequestsTable";

type InternalScreen = "login" | "dashboard";

const TOKEN_KEY = "internalToken";

export default function InternalApp() {
  const [screen, setScreen] = useState<InternalScreen | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // On mount: restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setScreen("dashboard");
    } else {
      setScreen("login");
    }
  }, []);

  async function handleLogin(
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    const res = await fetch("/api/internal/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
      setScreen("dashboard");
      return { success: true };
    }
    return { success: false, error: data.error };
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setScreen("login");
  }

  if (screen === null) return null;

  switch (screen) {
    case "login":
      return <LoginScreen onLogin={handleLogin} />;
    case "dashboard":
      return <RequestsTable token={token ?? ""} onLogout={handleLogout} />;
  }
}
