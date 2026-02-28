# adbarc92.github.io

Personal portfolio site — [adbarc92.github.io](https://adbarc92.github.io)

## Stack

- React 19 + TypeScript
- Vite
- React Router (client-side SPA)
- Markdown content with YAML frontmatter

## Development

```bash
npm install
npm run dev       # Dev server at localhost:5173
npm run build     # Type-check + production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Content

Blog posts and projects are Markdown files with YAML frontmatter:

- `content/blog/*.md` — Blog posts
- `content/projects/*.md` — Project entries
- `content/about.md` — About page

## Deployment

Pushes to `main` auto-deploy to GitHub Pages via GitHub Actions.
