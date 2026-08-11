import { Link } from 'react-router-dom';
import type { BlogFrontmatter } from '../lib/content';
import { formatDate } from '../lib/dates';
import DraftBadge from './DraftBadge';

interface Props {
  slug: string;
  frontmatter: BlogFrontmatter;
}

export default function BlogCard({ slug, frontmatter }: Props) {
  return (
    <Link
      to={`/blog/${slug}`}
      style={{
        display: 'block',
        padding: '1.5rem',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-gear-stroke)',
        borderRadius: '8px',
        transition: 'background 0.2s, border-color 0.2s',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-surface-hover)';
        e.currentTarget.style.borderColor = 'var(--color-accent-dim)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--color-surface)';
        e.currentTarget.style.borderColor = 'var(--color-gear-stroke)';
      }}
    >
      <DraftBadge draft={frontmatter.draft} />
      <time style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', letterSpacing: '0.04em' }}>
        {formatDate(frontmatter.date)}
      </time>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0.4rem 0', color: 'var(--color-text)' }}>
        {frontmatter.title}
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
        {frontmatter.excerpt}
      </p>
      {frontmatter.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
          {frontmatter.tags.map(tag => (
            <span key={tag} style={{
              fontSize: '0.75rem',
              color: 'var(--color-accent)',
              background: 'var(--color-accent-dim)',
              padding: '0.15rem 0.5rem',
              borderRadius: '3px',
              letterSpacing: '0.03em',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
