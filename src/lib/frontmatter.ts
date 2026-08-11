/**
 * The shapes of our content frontmatter. Pure types — shared by the app and by
 * scripts/prerender.ts, so keep this free of import.meta and of side effects.
 */

export type Category = 'software' | 'fiction' | 'politics' | 'meta';

/** Display order of the filter chips. Adding a category is a change to these two lines. */
export const CATEGORIES: readonly { id: Category; label: string }[] = [
  { id: 'software', label: 'Software' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'politics', label: 'Politics' },
  { id: 'meta', label: 'Meta' },
];

export interface BlogFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  category: Category;
  tags: string[];
  draft?: boolean;
}

export interface ProjectFrontmatter {
  title: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  date: string;
  links?: {
    github?: string;
    live?: string;
  };
}

export interface EidosFrontmatter {
  title: string;
  order: number;
  version: string;
  summary: string;
}

/**
 * The single draft rule. A post is published unless it is flagged a draft, and
 * drafts are shown only where the caller says so — the dev server, never a build.
 * Kept here so the four filter points cannot drift apart.
 */
export function isPublished(frontmatter: { draft?: boolean }, showDrafts: boolean): boolean {
  return showDrafts || !frontmatter.draft;
}
