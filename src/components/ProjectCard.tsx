import { Link } from 'react-router-dom';
import type { ProjectFrontmatter } from '../lib/content';

interface Props {
  slug: string;
  frontmatter: ProjectFrontmatter;
}

export default function ProjectCard({ slug, frontmatter }: Props) {
  return (
    <Link
      to={`/projects/${slug}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-gear-stroke)',
        borderRadius: '8px',
        overflow: 'hidden',
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
      {frontmatter.thumbnail && (
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <img
            src={frontmatter.thumbnail}
            alt={frontmatter.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      <div style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.4rem' }}>
          {frontmatter.title}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
          {frontmatter.description}
        </p>
        {frontmatter.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {frontmatter.tags.map(tag => (
              <span key={tag} style={{
                fontSize: '0.7rem',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-dim)',
                padding: '0.1rem 0.45rem',
                borderRadius: '3px',
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
