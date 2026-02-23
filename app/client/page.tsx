"use client";

import { useEffect, useState } from "react";
import { Screensaver } from "@/components/kiosk/Screensaver";
import { TabletSetup } from "@/components/kiosk/TabletSetup";
import { RoomKeypad } from "@/components/kiosk/RoomKeypad";
import { OtpKeypad } from "@/components/kiosk/OtpKeypad";
import { WaitingScreen } from "@/components/kiosk/WaitingScreen";

type ClientScreen = "setup" | "screensaver" | "room" | "otp" | "waiting";

const TABLET_ID_KEY = "tabletId";
// Auto-reset to screensaver after showing the waiting screen
const WAITING_RESET_MS = 10_000;

export default function ClientPortal() {
  const [screen, setScreen] = useState<ClientScreen | null>(null);
  const [tabletId, setTabletId] = useState<string | null>(null);
  const [phoneLastThree, setPhoneLastThree] = useState("00");
  const [roomNumber, setRoomNumber] = useState("");

  // On mount: check localStorage for saved tablet ID
  useEffect(() => {
    const saved = localStorage.getItem(TABLET_ID_KEY);
    if (saved) {
      setTabletId(saved);
      setScreen("screensaver");
    } else {
      setScreen("setup");
    }
  }, []);

  function handleTabletSetup(id: string) {
    localStorage.setItem(TABLET_ID_KEY, id);
    setTabletId(id);
    setScreen("screensaver");
  }

  async function handleRoomNumber(num: string): Promise<{ valid: boolean; error?: string }> {
    // TODO: POST /api/client/identify { tabletId, roomNumber: num }
    const res = await fetch("/api/client/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabletId, roomNumber: num }),
    });
    const data = await res.json();
    if (data.valid) {
      setRoomNumber(num);
      setPhoneLastThree(data.phoneLastThree);
      setScreen("otp");
      return { valid: true };
    }
    return { valid: false, error: data.error };
  }

  async function handleOtp(otp: string): Promise<{ valid: boolean; error?: string }> {
    // TODO: POST /api/client/verify-otp { tabletId, roomNumber, otp }
    const res = await fetch("/api/client/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabletId, roomNumber, otp }),
    });
    const data = await res.json();
    if (data.valid) {
      setScreen("waiting");
      // Auto-reset back to screensaver after WAITING_RESET_MS
      setTimeout(() => {
        setRoomNumber("");
        setScreen("screensaver");
      }, WAITING_RESET_MS);
      return { valid: true };
    }
    return { valid: false, error: data.error };
  }

  // Haven't determined screen yet (SSR safety)
  if (screen === null) return null;

  switch (screen) {
    case "setup":
      return <TabletSetup onConfirm={handleTabletSetup} />;
    case "screensaver":
      return <Screensaver onTouch={() => setScreen("room")} />;
    case "room":
      return (
        <RoomKeypad
          onConfirm={handleRoomNumber}
          onBack={() => setScreen("screensaver")}
        />
      );
    case "otp":
      return <OtpKeypad phoneLastThree={phoneLastThree} onConfirm={handleOtp} />;
    case "waiting":
      return <WaitingScreen />;
  }
}
