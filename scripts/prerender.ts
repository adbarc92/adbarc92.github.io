/**
 * Post-build static HTML generation.
 *
 * The site is a client-rendered SPA, so without this every route serves an
 * empty shell to crawlers and unfurlers. This walks the same content the app
 * globs, and writes a real HTML file per route with correct metadata and the
 * article text already in the body.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
  parseMarkdown,
  slugFromDatedPath,
  slugFromOrderedPath,
} from '../src/lib/markdown';
import type {
  BlogFrontmatter,
  ProjectFrontmatter,
  EidosFrontmatter,
} from '../src/lib/frontmatter';
import { SITE, pageTitle } from '../src/lib/site';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist');
const CONTENT = join(ROOT, 'content');

interface Page {
  /** Route path with a leading slash, '/' for the landing page. */
  route: string;
  title: string;
  description: string;
  /** Rendered article HTML, injected for non-JS clients. Empty for index pages. */
  body: string;
  /** 'article' for posts and documents, 'website' otherwise. */
  type: 'article' | 'website';
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function readCollection<T>(dir: string, slugFn: (path: string) => string) {
  const full = join(CONTENT, dir);
  if (!existsSync(full)) return [];
  return readdirSync(full)
    .filter(f => f.endsWith('.md'))
    .map(file => {
      const raw = readFileSync(join(full, file), 'utf8');
      const { frontmatter, html } = parseMarkdown<T>(raw);
      return { slug: slugFn(file), frontmatter, html };
    });
}

const posts = readCollection<BlogFrontmatter>('blog', slugFromDatedPath)
  .filter(p => !p.frontmatter.draft)
  .sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );

const projects = readCollection<ProjectFrontmatter>('projects', slugFromDatedPath).sort(
  (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
);

const eidosDocs = readCollection<EidosFrontmatter>('eidos', slugFromOrderedPath).sort(
  (a, b) => a.frontmatter.order - b.frontmatter.order
);

const pages: Page[] = [
  { route: '/', title: pageTitle(), description: SITE.description, body: '', type: 'website' },
  {
    route: '/blog',
    title: pageTitle('Writing'),
    description: 'Essays on software, fiction, and whatever else holds still long enough.',
    body: '',
    type: 'website',
  },
  {
    route: '/projects',
    title: pageTitle('Projects'),
    description: 'Selected work across software engineering, machine learning, and robotics.',
    body: '',
    type: 'website',
  },
  {
    route: '/about',
    title: pageTitle('About'),
    description: SITE.description,
    body: '',
    type: 'website',
  },
  {
    route: '/eidos',
    title: pageTitle('Eidos'),
    description:
      'An architecture for cheap code: humans design the Forms, agents fill them, fitness functions verify the fit.',
    body: '',
    type: 'website',
  },
  ...posts.map((p): Page => ({
    route: `/blog/${p.slug}`,
    title: pageTitle(p.frontmatter.title),
    description: p.frontmatter.excerpt,
    body: p.html,
    type: 'article',
  })),
  ...projects.map((p): Page => ({
    route: `/projects/${p.slug}`,
    title: pageTitle(p.frontmatter.title),
    description: p.frontmatter.description,
    body: p.html,
    type: 'article',
  })),
  ...eidosDocs.map((d): Page => ({
    route: `/eidos/${d.slug}`,
    title: pageTitle(d.frontmatter.title),
    description: d.frontmatter.summary,
    body: d.html,
    type: 'article',
  })),
];

const shell = readFileSync(join(DIST, 'index.html'), 'utf8');

function render(page: Page): string {
  const url = `${SITE.origin}${page.route}`;
  const tags = [
    `<title>${escapeAttr(page.title)}</title>`,
    `<meta name="description" content="${escapeAttr(page.description)}" />`,
    `<meta name="author" content="${escapeAttr(SITE.author)}" />`,
    `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:type" content="${page.type}" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE.title)}" />`,
    `<meta property="og:title" content="${escapeAttr(page.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(page.description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    SITE.image ? `<meta property="og:image" content="${escapeAttr(SITE.origin + SITE.image)}" />` : '',
    `<meta name="twitter:card" content="${SITE.image ? 'summary_large_image' : 'summary'}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${escapeAttr(SITE.title)}" href="${SITE.origin}/rss.xml" />`,
  ]
    .filter(Boolean)
    .join('\n    ');

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, tags)
    .replace(
      '<div id="root"></div>',
      `<div id="root">${page.body}</div>`
    );
}

let count = 0;
for (const page of pages) {
  const dir = page.route === '/' ? DIST : join(DIST, page.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), render(page), 'utf8');
  count++;
}

// The SPA fallback keeps the bare shell: it stands in for unknown URLs and must
// not claim another page's canonical or description.
writeFileSync(join(DIST, '404.html'), shell, 'utf8');

console.log(`prerender: wrote ${count} pages + 404.html`);
