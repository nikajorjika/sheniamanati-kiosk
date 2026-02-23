# Copilot Instructions

## Project Overview
`sheniamanati-kiosk` is a Next.js 16 tablet kiosk app for a parcel/cargo pickup company. It has two surfaces: an **external customer-facing tablet** (`/client`) and an **internal employee tablet** (`/internal`). The landing screen (`/`) lets you choose which to open.

**Language:** All UI text is in Georgian (`ka`). Keep it that way.

## Dev Commands
```bash
npm run dev    # localhost:3000
npm run build  # Production build (TypeScript checked)
npm start      # Serve production build
npm run lint   # ESLint flat config
```

## Route Map
| Route | Surface | Notes |
|---|---|---|
| `/` | Landing | Two half-screen nav buttons |
| `/client` | Customer tablet | Full kiosk flow |
| `/internal` | Employee tablet | Login → requests table |
| `/api/client/identify` | POST | Validate room number, return phone mask |
| `/api/client/verify-otp` | POST | Validate SMS OTP, create pickup request |
| `/api/internal/auth` | POST | Employee login (mock: `admin`/`admin123`) |
| `/api/internal/requests` | GET | Active pickup requests list |
| `/api/internal/mark-received` | POST | Mark a request as fulfilled |

## Project Structure
```
app/
  page.tsx                      # Landing — two full-height nav buttons
  client/page.tsx               # Customer portal state machine ("use client")
  internal/page.tsx             # Internal app state machine ("use client")
  api/client/identify/          # POST — room number validation
  api/client/verify-otp/        # POST — SMS OTP validation
  api/internal/auth/            # POST — employee login
  api/internal/requests/        # GET  — active requests
  api/internal/mark-received/   # POST — mark fulfilled
  globals.css                   # Tailwind v4 + full dark token system
  layout.tsx                    # lang="ka", className="dark", overflow-hidden
components/
  kiosk/
    Screensaver.tsx             # Idle screen — tap/touch to activate
    TabletSetup.tsx             # One-time tablet ID picker (3-digit keypad)
    RoomKeypad.tsx              # Step 1: 6-digit room number + NumericKeypad + 60s timeout
    OtpKeypad.tsx               # Step 2: 6-digit SMS OTP + NumericKeypad + phone mask
    WaitingScreen.tsx           # Confirmation — auto-resets to screensaver in 10s
  internal/
    LoginScreen.tsx             # Username + password form
    RequestsTable.tsx           # Active requests table — polls every 10s
  shared/
    NumericKeypad.tsx           # Touch-optimized 3×3 + 0 + ⌫ keypad
    OtpDisplay.tsx              # Row of N digit boxes with filled/active/error states
  ui/                           # shadcn/ui primitives (button, input, card, badge)
hooks/
  useInactivityTimer.ts         # 60s inactivity → callback; resets on pointer/touch/key
lib/
  utils.ts                      # cn() helper
```

## Customer Portal Flow (`/client`)
```
[no localStorage "tabletId"]
        │
        ▼
  TabletSetup  ──confirm──►  saved to localStorage → Screensaver
                                      │
                              Screensaver ──tap──► RoomKeypad
                                                       │ 60s idle → back to Screensaver
                                              POST /api/client/identify
                                                  │          │
                                               valid       invalid → show error, retry
                                                  │
                                             OtpKeypad (phone mask shown)
                                                  │
                                              POST /api/client/verify-otp
                                                  │          │
                                               valid       invalid → show error, retry
                                                  │
                                           WaitingScreen ──(10s)──► Screensaver
```
- Tablet ID: `localStorage["tabletId"]`, 3 digits, set once per device, persists across reloads.
- Room number and OTP both **auto-submit on 6th digit** — no separate confirm button.
- `useInactivityTimer(60_000, goBack)` is active on `RoomKeypad` only.

## Internal App Flow (`/internal`)
```
LoginScreen ── POST /api/internal/auth ──► RequestsTable
                                                │
                                     polls GET /api/internal/requests every 10s
                                                │
                                  "მიღებულია" → POST /api/internal/mark-received
                                             (row removed optimistically)
```

## Key Shared Components

### `NumericKeypad` (`components/shared/NumericKeypad.tsx`)
Props: `onDigit(digit: string)`, `onDelete()`, `disabled?`
Layout: 3×3 grid + bottom row [empty | 0 | ⌫]. Each key: `h-20 rounded-xl active:scale-95 active:bg-primary/10`.

### `OtpDisplay` (`components/shared/OtpDisplay.tsx`)
Props: `digits: string[]`, `length?: number (default 6)`, `activeIndex: number`, `error?: boolean`
- Filled: amber border + glow. Active: pulsing amber border. Error: destructive colors.

### `useInactivityTimer` (`hooks/useInactivityTimer.ts`)
```ts
useInactivityTimer(60_000, () => setScreen("screensaver"))
// Listens: pointermove, pointerdown, keydown, touchstart
```

## Art Direction — Design Language
**Always dark** — `.dark` is on `<html>`. Never use `prefers-color-scheme`.

**Palette (oklch):**
- Background: `oklch(0.07 0.012 265)` — near-black, blue-indigo tint
- Card/surface: `oklch(0.11 0.015 265)`
- **Primary: amber/gold** `oklch(0.78 0.19 55)` — buttons, borders, glow, active
- Success: `oklch(0.65 0.2 145)` — waiting screen, "mark received" button
- Destructive: `oklch(0.65 0.23 25)` — error states

**Typography:** `text-3xl font-bold` minimum for headings. Codes/numbers use `font-mono` (Geist Mono). Section labels: `text-sm tracking-widest uppercase text-primary`.

**Glow pattern:** `shadow-[0_0_32px_oklch(0.78_0.19_55/0.15)]` on hover. Ambient: `absolute div bg-primary/10 blur-[80px]` behind icons. Keys: `active:scale-95 active:bg-primary/10`.

## shadcn/ui
Add: `npx shadcn@latest add <component>`. Config: `new-york`, `neutral`, `lucide`.
Always use `cn()` from `@/lib/utils` for conditional classes.

## API Integration
All `app/api/` routes contain `// TODO:` where real DB/SMS calls go.
- `PickupRequest` type is exported from `app/api/internal/requests/route.ts`.
- Mock credentials: `admin` / `admin123`.

## Conventions
- `overflow-hidden` on `<body>` — all screens fill `h-screen w-screen`, no scrolling.
- Default to Server Components; `"use client"` only when hooks/browser APIs needed.
- `next-env.d.ts` — auto-generated, do not edit.
- ESLint flat config (`eslint.config.mjs`). No `.eslintrc.*` files.
