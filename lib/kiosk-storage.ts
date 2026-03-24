export interface KioskConfig {
  token: string;
  terminalId: number;
  terminalNumber: string;
  terminalName: string | null;
  terminalType: "front" | "warehouse";
  branchId: number;
  branchName: string;
}

const KEYS = {
  token: "kioskToken",
  terminalId: "kioskTerminalId",
  terminalNumber: "kioskTerminalNumber",
  terminalName: "kioskTerminalName",
  terminalType: "kioskTerminalType",
  branchId: "kioskBranchId",
  branchName: "kioskBranchName",
} as const;

export function loadKioskConfig(): KioskConfig | null {
  const token = localStorage.getItem(KEYS.token);
  const terminalId = localStorage.getItem(KEYS.terminalId);
  const terminalType = localStorage.getItem(KEYS.terminalType);
  const branchId = localStorage.getItem(KEYS.branchId);
  const branchName = localStorage.getItem(KEYS.branchName);

  if (!token || !terminalId || !terminalType || !branchId || !branchName) {
    return null;
  }

  return {
    token,
    terminalId: Number(terminalId),
    terminalNumber: localStorage.getItem(KEYS.terminalNumber) ?? "",
    terminalName: localStorage.getItem(KEYS.terminalName),
    terminalType: terminalType as KioskConfig["terminalType"],
    branchId: Number(branchId),
    branchName,
  };
}

export function saveKioskConfig(config: KioskConfig): void {
  localStorage.setItem(KEYS.token, config.token);
  localStorage.setItem(KEYS.terminalId, String(config.terminalId));
  localStorage.setItem(KEYS.terminalNumber, config.terminalNumber);
  localStorage.setItem(KEYS.terminalName, config.terminalName ?? "");
  localStorage.setItem(KEYS.terminalType, config.terminalType);
  localStorage.setItem(KEYS.branchId, String(config.branchId));
  localStorage.setItem(KEYS.branchName, config.branchName);
}

export function clearKioskConfig(): void {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
