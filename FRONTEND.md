# Frontend Design System

> Reference for all UI decisions in the `kiosk/` app. Follow these rules before introducing new styles or components.

---

## Viewport target

**Fixed landscape tablet — 1280 × 800 px.** Do not write responsive breakpoints. This is not a responsive web app.

---

## Theme

Always dark. The `dark` class is set on `<html>` in `layout.tsx` — never remove it.

---

## Color tokens (defined in `globals.css` `.dark` block)

| Token | Value | Use |
|---|---|---|
| `--background` | `oklch(0.07 0.012 265)` | Page/screen background |
| `--foreground` | `oklch(0.96 0.005 265)` | Primary text |
| `--card` | `oklch(0.11 0.015 265)` | Card surfaces |
| `--muted` | `oklch(0.16 0.018 265)` | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.52 0.015 265)` | Secondary/helper text |
| `--primary` | `oklch(0.78 0.19 55)` | Amber/gold — CTAs, highlights |
| `--primary-foreground` | `oklch(0.1 0.03 55)` | Text on amber |
| `--destructive` | `oklch(0.65 0.23 25)` | Errors, rejections |
| `--success` | `oklch(0.65 0.2 145)` | Confirmations, received status |
| `--border` | `oklch(0.22 0.015 265)` | Card/element borders |

Use Tailwind utility names: `bg-primary`, `text-muted-foreground`, `border-border`, etc.

---

## Touch targets

All interactive elements must meet a **minimum 56 px height** (kiosk-sm) or **64 px height** (kiosk). Use the button size variants:

| Size | Height | Use case |
|---|---|---|
| `kiosk` | 64 px (`h-16`) | Primary CTAs (confirm, submit, main actions) |
| `kiosk-sm` | 56 px (`h-14`) | Secondary actions (cancel, back, resend) |
| `icon-kiosk` | 64 px square | Large icon-only buttons |
| `lg` | 40 px | Internal UI only (never on touch screens) |

**Do not use `default`, `sm`, or `xs` sizes on public-facing kiosk screens.**

---

## Components

### Available primitives (`components/ui/`)
- `Button` — use with `variant` + `size` props; see touch target rules above
- `Input` — form inputs
- `Card`, `CardHeader`, `CardContent`, `CardFooter` — surface/container
- `Badge` — generic badge
- `StatusBadge` — semantic status display (see below)

### StatusBadge (`components/ui/status-badge.tsx`)

Maps domain status strings to semantic colors automatically:

```tsx
<StatusBadge status="pending" />   // amber — "მოლოდინში"
<StatusBadge status="received" />  // green  — "გაცემულია"
<StatusBadge status="rejected" />  // red    — "უარყოფილია"
<StatusBadge status="arrived" />   // amber  — "მოვიდა"
```

Override label with `label` prop if needed. Use this instead of ad-hoc badge styling.

---

## Typography

- Font: Geist Sans (`--font-geist-sans`) for all UI text
- Font: Geist Mono (`--font-geist-mono`) for codes, tracking numbers, OTPs
- **All UI text must remain in Georgian.** Do not translate or replace Georgian strings.

---

## Interaction rules

- **No hover-only interactions.** Hover states may exist but must never be the only affordance.
- **No tooltips** on kiosk screens — users cannot hover.
- **No keyboard shortcuts** — kiosk runs in tablet touch mode.
- Tappable area must always match the visible element — no tiny click targets with invisible padding hacks.

---

## Layout conventions

- Full-screen pages use `min-h-screen` or `h-screen` with `overflow-hidden` (set on `<body>` in `layout.tsx`)
- Use `flex` or `grid` for layout — avoid absolute positioning except for overlays/screensaver
- Consistent spacing: prefer `gap-4` (16px), `gap-6` (24px), `gap-8` (32px) — do not invent new scales

---

## File structure

```
components/
  ui/          # Generic primitives (Button, Card, Badge, StatusBadge, Input)
  kiosk/       # Customer-facing screens (Screensaver, OtpKeypad, RoomKeypad, etc.)
  internal/    # Warehouse/employee screens (LoginScreen, RequestsTable)
  shared/      # Reusable across both flows (NumericKeypad, OtpDisplay)
```

Put new components in the correct directory. Do not add business logic to `components/ui/`.

---

## What to avoid

- Do not invent new color values — use tokens
- Do not create one-off styled `<div>` wrappers when a Card or Button variant exists
- Do not add responsive breakpoints (`sm:`, `md:`, `lg:`) — fixed viewport
- Do not use `hover:` as the only interactive affordance
- Do not use `<a>` tags for in-app navigation — use Next.js `<Link>` or `router.push`
