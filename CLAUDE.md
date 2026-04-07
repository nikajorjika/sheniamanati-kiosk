# CLAUDE.md — kiosk (Next.js)

Next.js 16 tablet kiosk app for parcel/cargo pickup. Two surfaces:
- `/client` — customer-facing tablet
- `/internal` — employee/warehouse tablet
- `/` — landing + device setup

**All UI text is Georgian (`ka`). Never change text to another language.**

## Stack
- Next.js 16, TypeScript, App Router
- Tailwind CSS v4
- shadcn/ui (`new-york` style, `neutral` base, `lucide` icons)
- `@serwist/next` for PWA/service worker
- `cn()` from `@/lib/utils` for conditional classes

## Commands
```bash
npm run dev               # localhost:3000
npm run lint              # ESLint — fix all new errors before finishing
npm run build             # TypeScript check + production build (uses --webpack internally)
```

**Important:** `next build` must use `--webpack` — Turbopack breaks `@serwist/next`. This is already in the build script; do not change it.

## All API Routes Are Proxied
`kiosk/app/api/**` → `api/routes/api.php` via `API_URL` env var. Never put business logic in kiosk API routes — they are thin proxies only.

## Key Architecture Rules
- Default to Server Components. Add `"use client"` only when hooks or browser APIs are needed.
- `overflow-hidden` on `<body>` — every screen fills `h-screen w-screen`, no scrolling anywhere.
- `lang="ka"` and `className="dark"` on `<html>` in `app/layout.tsx` — do not change these.
- Never use `prefers-color-scheme` — the app is always dark.

## Design System

Read `kiosk/FRONTEND.md` before writing any new UI.

### Palette (oklch)
| Token | Value | Usage |
|-------|-------|-------|
| Background | `oklch(0.07 0.012 265)` | page background |
| Surface/Card | `oklch(0.11 0.015 265)` | cards, panels |
| **Primary** | `oklch(0.78 0.19 55)` | amber/gold — buttons, borders, glow, active |
| Success | `oklch(0.65 0.2 145)` | waiting screen, "mark received" |
| Destructive | `oklch(0.65 0.23 25)` | error states |

### Button sizes for kiosk (touch targets)
- `size="kiosk"` — 64px height, for primary CTAs
- `size="kiosk-sm"` — 56px height, for secondary actions
- **Never use `default`, `sm`, or `xs`** on touch screens.

### Typography
- Headings: `text-3xl font-bold` minimum
- Codes/numbers: `font-mono` (Geist Mono)
- Section labels: `text-sm tracking-widest uppercase text-primary`

### Glow pattern
```css
/* hover glow */ shadow-[0_0_32px_oklch(0.78_0.19_55/0.15)]
/* ambient */    absolute div bg-primary/10 blur-[80px]
/* key press */  active:scale-95 active:bg-primary/10
```

## Storage
All localStorage access goes through `kiosk/lib/kiosk-storage.ts`. Never access `localStorage` directly — use the helpers there.

Keys: `kioskToken`, `kioskTerminalId`, `kioskTerminalType`, `kioskBranchId`, `kioskBranchName`, `kioskTerminalNumber`, `kioskTerminalName`

## Auth Flow (kiosk activation)
1. Device navigates to `/` → enters `short_code` + `access_code`
2. `POST /api/kiosk/activate` returns Bearer token + terminal metadata
3. Token stored in localStorage; subsequent requests send `Authorization: Bearer <token>`
4. `type=front` → routes to `/client`; `type=warehouse` → routes to `/internal`

## Key Components
| Path | Purpose |
|------|---------|
| `components/kiosk/KioskSetupScreen.tsx` | Activation UI |
| `components/shared/NumericKeypad.tsx` | Touch-optimized 3×3+0+⌫ keypad |
| `components/shared/OtpDisplay.tsx` | Digit boxes with filled/active/error states |
| `components/ui/status-badge.tsx` | `pending`\|`received`\|`rejected`\|`arrived` → colored Georgian label |
| `hooks/useInactivityTimer.ts` | 60s idle → callback |
| `lib/kiosk-storage.ts` | Centralized localStorage helpers |

## UI Component Rules
- Use `StatusBadge` from `components/ui/status-badge.tsx` for package/request statuses — never ad-hoc badge styling.
- Add shadcn components: `npx shadcn@latest add <component>`

## Pre-existing Lint Warnings (do not fix unless asked)
- `react-hooks/set-state-in-effect` in `page.tsx`, `client/page.tsx`, `internal/page.tsx`
- `react-hooks/refs` in `hooks/useInactivityTimer.ts`
- Warnings in `public/sw.js` (compiled artifact — do not edit)

These existed before your work. Do not let your changes introduce new lint errors.

## PWA
- Service worker source: `app/sw.ts` (compiled to `public/sw.js` at build)
- Manifest: `app/manifest.ts`
- Icons in `public/icons/` — amber placeholders, replace with real logo when available

## MCP Tooling
`.mcp.json` at project root wires `next-devtools-mcp`. Start `npm run dev` first, then tools like `get_errors`, `get_routes`, `get_logs` are available.

## Playwright E2E
```bash
npx playwright test    # Chromium only, viewport 1280×800
```
Tests live in `kiosk/tests/e2e/`. Config: `kiosk/playwright.config.ts`.
