import Link from "next/link";
import { Package, Tablet } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex h-screen w-screen bg-background">
      {/* Client Portal */}
      <Link
        href="/client"
        className="group relative flex flex-1 flex-col items-center justify-center gap-8 border-r border-border transition-colors hover:bg-secondary/40"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/8 blur-[80px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-all group-hover:border-primary/30 group-hover:shadow-[0_0_32px_oklch(0.78_0.19_55/0.15)]">
            <Package
              className="h-14 w-14 text-muted-foreground transition-colors group-hover:text-primary"
              strokeWidth={1.5}
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">კლიენტის პორტალი</h2>
            <p className="mt-2 text-base text-muted-foreground">
              ამანათის გამოტანის მოთხოვნა
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 right-8 h-8 w-8 rounded-br-md border-b-2 border-r-2 border-primary/15 transition-colors group-hover:border-primary/40" />
      </Link>

      {/* Internal App */}
      <Link
        href="/internal"
        className="group relative flex flex-1 flex-col items-center justify-center gap-8 transition-colors hover:bg-secondary/40"
      >
        {/* Ambient glow */}
        <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/8 blur-[80px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex flex-col items-center gap-6">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-all group-hover:border-primary/30 group-hover:shadow-[0_0_32px_oklch(0.78_0.19_55/0.15)]">
            <Tablet
              className="h-14 w-14 text-muted-foreground transition-colors group-hover:text-primary"
              strokeWidth={1.5}
            />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">შიდა სისტემა</h2>
            <p className="mt-2 text-base text-muted-foreground">
              თანამშრომლის პანელი
            </p>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 right-8 h-8 w-8 rounded-br-md border-b-2 border-r-2 border-primary/15 transition-colors group-hover:border-primary/40" />
      </Link>

      {/* Center divider dot */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-border" />
    </div>
  );
}
