/** Shared by the app and by scripts/prerender.ts. Keep free of import.meta. */
export const SITE = {
  origin: 'https://adbarc92.github.io',
  title: 'Alex Barclay',
  author: 'Alex Barclay',
  description:
    'Software engineering, machine learning, and robotics — essays, projects, and the Eidos architecture.',
  /** Absolute path under public/, e.g. '/images/og.png'. Unset until one exists. */
  image: undefined as string | undefined,
};

export function pageTitle(page?: string): string {
  return page ? `${page} — ${SITE.title}` : SITE.title;
}
