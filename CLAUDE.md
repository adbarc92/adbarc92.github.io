# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site built as an interactive geometric portal — a futuristic SVG-based composition with animated shapes, hover effects, and a reveal animation. React 19 + TypeScript + Vite.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check (tsc -b) then production build
npm run lint      # ESLint (flat config, TS-aware)
npm run preview   # Preview production build
```

No test framework is configured.

## Architecture

The app is currently a single interactive SVG component:

- **`src/main.tsx`** — React entry point, renders `<App />` in StrictMode
- **`src/App.tsx`** — `FuturisticGeometric` component: the entire portal UI. All graphics are inline SVG with JS-driven animations (setInterval for sparks, SVG `<animate>` for pulsing). Key state: `hoveredLine`, `isRevealing`, `rotationAngle`, `sparks[]`
- **`design/README.md`** — Detailed concept doc describing the portal's structure, interaction states, and four cardinal themes (Knowledge, Power, Wisdom, Harmony)

## Key Patterns

- All rendering is SVG — geometric shapes are computed from window dimensions, not CSS layout
- Animations mix JS intervals (spark particles) with native SVG `<animate>` elements
- No routing, no external UI library, no CSS framework currently installed
- TypeScript strict mode enabled; no unused locals/parameters allowed

## Branches

- `master` — main branch
- `new` — current active development branch
- `svelte` — previous Svelte iteration (historical)
