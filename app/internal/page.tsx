"use client";

import { useEffect, useState } from "react";
import { LoginScreen } from "@/components/internal/LoginScreen";
import { InternalBranchSelector } from "@/components/internal/BranchSelector";
import { RequestsTable } from "@/components/internal/RequestsTable";
import type { Branch } from "@/components/kiosk/BranchSelector";

type InternalScreen = "login" | "branch-select" | "dashboard";

const TOKEN_KEY = "internalToken";

export default function InternalApp() {
  const [screen, setScreen] = useState<InternalScreen | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // On mount: restore token from localStorage, always require branch selection
  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      setToken(saved);
      setScreen("branch-select");
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
      setScreen("branch-select");
      return { success: true };
    }
    return { success: false, error: data.error };
  }

  function handleBranchSelect(branch: Branch) {
    setSelectedBranch(branch);
    setScreen("dashboard");
  }

  function handleChangeBranch() {
    setSelectedBranch(null);
    setScreen("branch-select");
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setSelectedBranch(null);
    setScreen("login");
  }

  if (screen === null) return null;

  switch (screen) {
    case "login":
      return <LoginScreen onLogin={handleLogin} />;
    case "branch-select":
      return <InternalBranchSelector onSelect={handleBranchSelect} />;
    case "dashboard":
      return (
        <RequestsTable
          token={token ?? ""}
          branch={selectedBranch!}
          onChangeBranch={handleChangeBranch}
          onLogout={handleLogout}
        />
      );
  }
}
