"use client";

import { cn } from "@/lib/utils";

interface KioskShellProps {
  /** Center header text — typically branch + terminal name */
  title?: string;
  /** Slot for right-side header actions (icons etc.) */
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  /** Full footer row content. Pass null to omit the footer bar entirely. */
  footer?: React.ReactNode;
  className?: string;
}

/**
 * Persistent chrome used on staff-setup and customer-entry screens.
 * Layout: fixed header → flex-1 content → optional fixed footer.
 *
 * Design tokens that control sizing:
 *   --kiosk-header-height  (default 68px)
 *   --kiosk-footer-height  (default 64px)
 */
export function KioskShell({
  title,
  headerRight,
  children,
  footer,
  className,
}: KioskShellProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-screen h-screen bg-background",
        className
      )}
    >
      {/* ── Header ───────────────────────────────────────────────── */}
      <header
        className="shrink-0 flex items-center justify-between px-8 bg-surface-container-lowest"
        style={{ height: "var(--kiosk-header-height)" }}
      >
        {/* Left — app name */}
        <span className="text-sm font-semibold text-foreground select-none whitespace-nowrap">
          ტვირთების მართვა
        </span>

        {/* Center — branch / terminal name */}
        {title ? (
          <span className="text-base font-bold text-primary select-none">
            {title}
          </span>
        ) : (
          <span />
        )}

        {/* Right — action icons */}
        <div className="flex items-center gap-3 text-muted-foreground min-w-[4rem] justify-end">
          {headerRight}
        </div>
      </header>

      {/* ── Content ──────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {children}
      </main>

      {/* ── Footer ───────────────────────────────────────────────── */}
      {footer !== undefined && (
        <footer
          className="shrink-0 flex items-center justify-between px-8 bg-surface-container-lowest"
          style={{ height: "var(--kiosk-footer-height)" }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
}
