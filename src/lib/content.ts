import { parse as parseYaml } from 'yaml';
import { marked, type Tokens } from 'marked';
import hljs from 'highlight.js';

// Configure marked with syntax highlighting
marked.use({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }: Tokens.Code): string {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    },
  },
});

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

export interface ContentEntry<T> {
  slug: string;
  frontmatter: T;
  html: string;
}

function parseMarkdown<T>(raw: string): { frontmatter: T; html: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: {} as T, html: marked.parse(raw) as string };
  }
  const frontmatter = parseYaml(match[1]) as T;
  const html = marked.parse(match[2]) as string;
  return { frontmatter, html };
}

function slugFromPath(path: string): string {
  const filename = path.split('/').pop()!.replace(/\.md$/, '');
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
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
  const entries: ContentEntry<BlogFrontmatter>[] = [];
  for (const [path, loader] of Object.entries(blogModules)) {
    const raw = await loader();
    const { frontmatter, html } = parseMarkdown<BlogFrontmatter>(raw);
    entries.push({ slug: slugFromPath(path), frontmatter, html });
  }
  return entries.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export async function loadBlogPost(slug: string): Promise<ContentEntry<BlogFrontmatter> | null> {
  for (const [path, loader] of Object.entries(blogModules)) {
    if (slugFromPath(path) === slug) {
      const raw = await loader();
      const { frontmatter, html } = parseMarkdown<BlogFrontmatter>(raw);
      return { slug, frontmatter, html };
    }
  }
  return null;
}

export async function loadProjects(): Promise<ContentEntry<ProjectFrontmatter>[]> {
  const entries: ContentEntry<ProjectFrontmatter>[] = [];
  for (const [path, loader] of Object.entries(projectModules)) {
    const raw = await loader();
    const { frontmatter, html } = parseMarkdown<ProjectFrontmatter>(raw);
    entries.push({ slug: slugFromPath(path), frontmatter, html });
  }
  return entries.sort(
    (a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime()
  );
}

export async function loadProject(slug: string): Promise<ContentEntry<ProjectFrontmatter> | null> {
  for (const [path, loader] of Object.entries(projectModules)) {
    if (slugFromPath(path) === slug) {
      const raw = await loader();
      const { frontmatter, html } = parseMarkdown<ProjectFrontmatter>(raw);
      return { slug, frontmatter, html };
    }
  }
  return null;
}
