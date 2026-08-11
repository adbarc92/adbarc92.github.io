import {
  parseMarkdown,
  slugFromDatedPath,
} from './markdown';
import type { BlogFrontmatter, ProjectFrontmatter } from './frontmatter';

export type { BlogFrontmatter, ProjectFrontmatter } from './frontmatter';

export interface ContentEntry<T> {
  slug: string;
  frontmatter: T;
  html: string;
}

type RawModules = Record<string, () => Promise<string>>;
type SlugFn = (path: string) => string;

async function loadAll<T>(modules: RawModules, slugFn: SlugFn): Promise<ContentEntry<T>[]> {
  const entries: ContentEntry<T>[] = [];
  for (const [path, loader] of Object.entries(modules)) {
    const raw = await loader();
    const { frontmatter, html } = parseMarkdown<T>(raw);
    entries.push({ slug: slugFn(path), frontmatter, html });
  }
  return entries;
}

async function loadOne<T>(
  modules: RawModules,
  slugFn: SlugFn,
  slug: string
): Promise<ContentEntry<T> | null> {
  for (const [path, loader] of Object.entries(modules)) {
    if (slugFn(path) === slug) {
      const raw = await loader();
      const { frontmatter, html } = parseMarkdown<T>(raw);
      return { slug, frontmatter, html };
    }
  }
  return null;
}

function byDateDesc<T extends { date: string }>(
  a: ContentEntry<T>,
  b: ContentEntry<T>
): number {
  return new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime();
}

const blogModules = import.meta.glob<string>('/content/blog/*.md', {
  query: '?raw',
  import: 'default',
});

const projectModules = import.meta.glob<string>('/content/projects/*.md', {
  query: '?raw',
  import: 'default',
});

export async function loadBlogPosts(): Promise<ContentEntry<BlogFrontmatter>[]> {
  const entries = await loadAll<BlogFrontmatter>(blogModules, slugFromDatedPath);
  return entries.sort(byDateDesc);
}

export async function loadBlogPost(slug: string): Promise<ContentEntry<BlogFrontmatter> | null> {
  return loadOne<BlogFrontmatter>(blogModules, slugFromDatedPath, slug);
}

export async function loadProjects(): Promise<ContentEntry<ProjectFrontmatter>[]> {
  const entries = await loadAll<ProjectFrontmatter>(projectModules, slugFromDatedPath);
  return entries.sort(byDateDesc);
}

export async function loadProject(slug: string): Promise<ContentEntry<ProjectFrontmatter> | null> {
  return loadOne<ProjectFrontmatter>(projectModules, slugFromDatedPath, slug);
}
