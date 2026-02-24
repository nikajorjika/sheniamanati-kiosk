"use client";

import { useEffect, useState } from "react";
import { Screensaver } from "@/components/kiosk/Screensaver";
import { BranchSelector, type Branch } from "@/components/kiosk/BranchSelector";
import { TerminalSelector } from "@/components/kiosk/TerminalSelector";
import { RoomKeypad } from "@/components/kiosk/RoomKeypad";
import { OtpKeypad } from "@/components/kiosk/OtpKeypad";
import { WaitingScreen } from "@/components/kiosk/WaitingScreen";

type ClientScreen = "branch-select" | "terminal-select" | "screensaver" | "room" | "otp" | "waiting";

const TABLET_ID_KEY = "tabletId";
const BRANCH_ID_KEY = "branchId";
const BRANCH_NAME_KEY = "branchName";

export default function ClientPortal() {
  const [screen, setScreen] = useState<ClientScreen | null>(null);
  const [tabletId, setTabletId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [phoneLastThree, setPhoneLastThree] = useState("00");
  const [roomNumber, setRoomNumber] = useState("");
  const [packageCount, setPackageCount] = useState(0);
  const [trackingNumbers, setTrackingNumbers] = useState<string[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);

  // On mount: restore saved terminal from localStorage
  useEffect(() => {
    const savedTabletId = localStorage.getItem(TABLET_ID_KEY);
    const savedBranchId = localStorage.getItem(BRANCH_ID_KEY);
    const savedBranchName = localStorage.getItem(BRANCH_NAME_KEY);

    if (savedTabletId && savedBranchId && savedBranchName) {
      setTabletId(savedTabletId);
      setSelectedBranch({ id: Number(savedBranchId), name: savedBranchName });
      setScreen("screensaver");
    } else {
      setScreen("branch-select");
    }
  }, []);

  function handleBranchSelect(branch: Branch) {
    setSelectedBranch(branch);
    setScreen("terminal-select");
  }

  function handleTerminalSelect(terminal: { id: number; number: string; name: string | null }) {
    const id = String(terminal.id);
    localStorage.setItem(TABLET_ID_KEY, id);
    localStorage.setItem(BRANCH_ID_KEY, String(selectedBranch!.id));
    localStorage.setItem(BRANCH_NAME_KEY, selectedBranch!.name);
    setTabletId(id);
    setScreen("screensaver");
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

  switch (screen) {
    case "branch-select":
      return <BranchSelector onSelect={handleBranchSelect} />;
    case "terminal-select":
      return (
        <TerminalSelector
          branch={selectedBranch!}
          onSelect={handleTerminalSelect}
          onBack={() => setScreen("branch-select")}
        />
      );
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
      return (
        <OtpKeypad
          phoneLastThree={phoneLastThree}
          onConfirm={handleOtp}
          onResend={handleResend}
          onCancel={handleOtpCancel}
        />
      );
    case "waiting":
      return <WaitingScreen packageCount={packageCount} trackingNumbers={trackingNumbers} requestId={requestId} onDone={handleWaitingDone} />;
  }
}
