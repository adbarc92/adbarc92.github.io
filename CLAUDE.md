# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site with animated gear background, blog, project showcase, and about page. React 19 + TypeScript + Vite SPA with client-side routing.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Type-check (tsc -b) then production build
npm run lint      # ESLint (flat config, TS-aware)
npm run preview   # Preview production build
```

No test framework is configured.

## Architecture

Multi-page SPA with persistent animated background:

- **`src/main.tsx`** — React entry point, renders `<App />` in StrictMode
- **`src/App.tsx`** — Router setup with `createBrowserRouter` (react-router-dom)
- **`src/components/Layout.tsx`** — Persistent layout: GearBackground + NavBar + Outlet
- **`src/components/GearBackground.tsx`** — Animated SVG gear background (requestAnimationFrame)
- **`src/components/NavBar.tsx`** — Fixed nav bar (hidden on landing page)
- **`src/lib/gears.ts`** — Procedural SVG gear path generation
- **`src/lib/content.ts`** — Markdown content pipeline (import.meta.glob + yaml + marked)
- **`src/pages/`** — Landing, Blog, BlogPost, Projects, ProjectDetail, About

### Content

Blog posts and projects are Markdown files with YAML frontmatter:

- **`content/blog/*.md`** — Blog posts (date prefix in filename for slug)
- **`content/projects/*.md`** — Project entries
- **`content/about.md`** — About page content

### Deployment

Static build deployed to GitHub Pages via `.github/workflows/deploy.yml`. 404.html copies index.html for SPA routing.

## Key Patterns

- Animated gear background is a fixed SVG layer behind all content (z-index 0)
- Direct DOM manipulation for gear rotation (performance — avoids React re-renders)
- Content loaded via `import.meta.glob` with `?raw` query, parsed at runtime
- All pages use inline styles via React style objects
- TypeScript strict mode enabled; no unused locals/parameters allowed

## Branches

- `master` — main branch (deploys to GitHub Pages)
- `new` — current active development branch
