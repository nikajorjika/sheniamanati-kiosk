"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KioskSetupScreen } from "@/components/kiosk/KioskSetupScreen";
import { loadKioskConfig, saveKioskConfig, type KioskConfig } from "@/lib/kiosk-storage";

export default function LandingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const config = loadKioskConfig();
    if (config) {
      router.replace(config.terminalType === "warehouse" ? "/internal" : "/client");
    } else {
      setReady(true);
    }
  }, [router]);

  function handleActivate(config: KioskConfig) {
    saveKioskConfig(config);
    router.replace(config.terminalType === "warehouse" ? "/internal" : "/client");
  }

  if (!ready) return null;

  return <KioskSetupScreen onActivate={handleActivate} />;
}
