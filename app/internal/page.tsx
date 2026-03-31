"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequestsTable } from "@/components/internal/RequestsTable";
import type { Branch } from "@/components/kiosk/BranchSelector";
import { loadKioskConfig, clearKioskConfig } from "@/lib/kiosk-storage";

export default function InternalApp() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [branch, setBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const config = loadKioskConfig();
    if (!config || config.terminalType !== "warehouse") {
      router.replace("/");
      return;
    }
    setToken(config.token);
    setBranch({ id: config.branchId, name: config.branchName });
  }, [router]);

  function handleLogout() {
    clearKioskConfig();
    router.replace("/");
  }

  if (!token || !branch) return null;

  return (
    <RequestsTable
      token={token}
      branch={branch}
      onLogout={handleLogout}
    />
  );
}
