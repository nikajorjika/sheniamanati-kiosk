"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Screensaver } from "@/components/kiosk/Screensaver";
import { RoomKeypad } from "@/components/kiosk/RoomKeypad";
import { OtpKeypad } from "@/components/kiosk/OtpKeypad";
import { WaitingScreen } from "@/components/kiosk/WaitingScreen";
import { loadKioskConfig, clearKioskConfig } from "@/lib/kiosk-storage";

type ClientScreen = "screensaver" | "room" | "otp" | "waiting";

export default function ClientPortal() {
  const router = useRouter();
  const [screen, setScreen] = useState<ClientScreen | null>(null);
  const [tabletId, setTabletId] = useState<string | null>(null);
  const [phoneLastThree, setPhoneLastThree] = useState("00");
  const [roomNumber, setRoomNumber] = useState("");
  const [packageCount, setPackageCount] = useState(0);
  const [trackingNumbers, setTrackingNumbers] = useState<string[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const config = loadKioskConfig();
    if (!config || config.terminalType !== "front") {
      router.replace("/");
      return;
    }
    setTabletId(String(config.terminalId));
    setScreen("screensaver");
  }, [router]);

  function handleResetDevice() {
    clearKioskConfig();
    router.replace("/");
  }

  async function handleRoomNumber(num: string): Promise<{ valid: boolean; error?: string }> {
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

  async function handleResend(): Promise<void> {
    const res = await fetch("/api/client/identify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabletId, roomNumber }),
    });
    const data = await res.json();
    if (data.valid) {
      setPhoneLastThree(data.phoneLastThree);
    }
  }

  function handleOtpCancel() {
    setRoomNumber("");
    setScreen("screensaver");
  }

  async function handleOtp(otp: string): Promise<{ valid: boolean; error?: string }> {
    const res = await fetch("/api/client/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabletId, roomNumber, otp }),
    });
    const data = await res.json();
    if (data.valid) {
      setPackageCount(data.package_count ?? 0);
      setTrackingNumbers(data.tracking_numbers ?? []);
      setRequestId(data.request_id ?? null);
      setScreen("waiting");
      return { valid: true };
    }
    return { valid: false, error: data.error };
  }

  function handleWaitingDone() {
    setRoomNumber("");
    setPackageCount(0);
    setTrackingNumbers([]);
    setRequestId(null);
    setScreen("screensaver");
  }

  if (screen === null) return null;

  return (
    <>
      {/* Reset device — gear icon, only visible on screensaver */}
      {screen === "screensaver" && (
        <div className="fixed bottom-4 right-4 z-50">
          {showResetConfirm ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 shadow-lg">
              <span className="text-sm text-muted-foreground">გარeset?</span>
              <button
                onClick={handleResetDevice}
                className="text-sm font-semibold text-destructive"
              >
                დიახ
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-sm text-muted-foreground"
              >
                არა
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground opacity-30 hover:opacity-100 transition-opacity"
            >
              <Settings className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
        </div>
      )}

      {screen === "screensaver" && <Screensaver onTouch={() => setScreen("room")} />}
      {screen === "room" && (
        <RoomKeypad
          onConfirm={handleRoomNumber}
          onBack={() => setScreen("screensaver")}
        />
      )}
      {screen === "otp" && (
        <OtpKeypad
          phoneLastThree={phoneLastThree}
          onConfirm={handleOtp}
          onResend={handleResend}
          onCancel={handleOtpCancel}
        />
      )}
      {screen === "waiting" && (
        <WaitingScreen
          packageCount={packageCount}
          trackingNumbers={trackingNumbers}
          requestId={requestId}
          onDone={handleWaitingDone}
        />
      )}
    </>
  );
}
