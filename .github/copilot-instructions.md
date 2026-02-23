# Copilot Instructions

## Project Overview
`sheniamanati-kiosk` is a Next.js 16 kiosk application using the **App Router** (not Pages Router), React 19, TypeScript 5, Tailwind CSS 4, and **shadcn/ui** (new-york style).

## Dev Commands
```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm start      # Serve production build
npm run lint   # ESLint (flat config, Next.js core web vitals + TypeScript rules)
```

## Project Structure
```
app/              # App Router: layouts, pages, and route segments
  layout.tsx      # Root layout — Geist fonts, metadata, HTML shell
  page.tsx        # Home page (/ route)
  globals.css     # Tailwind entry + shadcn CSS vars (oklch color system)
components/ui/    # shadcn/ui components (auto-generated, do not hand-edit)
lib/
  utils.ts        # cn() helper (clsx + tailwind-merge)
hooks/            # Custom React hooks
public/           # Static assets served at /
components.json   # shadcn config (style, aliases, icon library)
next.config.ts    # Next.js config (currently empty, typed as NextConfig)
```

New routes: add a directory under `app/` with `page.tsx`. API routes: `app/api/<name>/route.ts`.

## shadcn/ui

**Adding components:**
```bash
npx shadcn@latest add <component>   # e.g. button, input, dialog
```
Components are copied into `components/ui/` — they're owned by this repo and can be modified freely.

**Config** (`components.json`): style=`new-york`, baseColor=`neutral`, icons=`lucide`, RSC=`true`.

**`cn()` utility** — always use for conditional/merged Tailwind classes:
```ts
import { cn } from "@/lib/utils"
<div className={cn("base-class", isActive && "active-class")} />
```

**Path aliases** (defined in `components.json` and `tsconfig.json`):
- `@/components` — shared components
- `@/components/ui` — shadcn primitives
- `@/lib` — utilities
- `@/hooks` — custom hooks

## Styling — Tailwind CSS v4 + shadcn

- CSS entry point is `app/globals.css`. Imports: `tailwindcss`, `tw-animate-css`, `shadcn/tailwind.css`.
- All design tokens are CSS custom properties using **oklch color space** (e.g. `--primary: oklch(0.205 0 0)`). Edit them in `globals.css` `:root` / `.dark` blocks.
- `@theme inline` maps Tailwind utility names to CSS vars (e.g. `bg-primary` → `var(--primary)`). Add new tokens here.
- **Dark mode uses the `.dark` class** (applied to `<html>` or a parent element), not `prefers-color-scheme`. Use `@custom-variant dark (&:is(.dark *))` is already configured.

## TypeScript & Components

- Strict mode enabled. `@/*` alias resolves to the project root.
- Default to **React Server Components**. Add `"use client"` only when hooks or browser APIs are needed.
- Use `next/image` for images, `next/font` (Geist Sans/Mono) is already configured in `layout.tsx`.
- `next-env.d.ts` is auto-generated — do not edit.

## ESLint
Flat config (`eslint.config.mjs`). Do not create `.eslintrc.*` files. Ignored: `.next/`, `out/`, `build/`.

## Not Yet Set Up
No testing framework, database, auth, or environment variables. Use `.env.local` for secrets (gitignored).
