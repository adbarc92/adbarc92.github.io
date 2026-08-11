/**
 * The shapes of our content frontmatter. Pure types — shared by the app and by
 * scripts/prerender.ts, so keep this free of import.meta and of side effects.
 */

export interface BlogFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
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
