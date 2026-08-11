import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadEidosDocs, type ContentEntry, type EidosFrontmatter } from '../lib/content';
import { pageTitle } from '../lib/site';

export default function Eidos() {
  const [docs, setDocs] = useState<ContentEntry<EidosFrontmatter>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEidosDocs().then(d => { setDocs(d); setLoading(false); });
  }, []);

  const version = docs[0]?.frontmatter.version;

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <title>{pageTitle('Eidos')}</title>
      <meta
        name="description"
        content="An architecture for cheap code: humans design the Forms, agents fill them, and fitness functions verify the fit."
      />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Eidos</h1>
        {version && (
          <span style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-accent)',
            background: 'var(--color-accent-dim)',
            padding: '0.15rem 0.5rem',
            borderRadius: '3px',
          }}>
            v{version}
          </span>
        )}
      </div>

      <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0 2.5rem', lineHeight: 1.7 }}>
        An architecture for cheap code: humans design the Forms, agents fill them, and
        fitness functions verify the fit. The argument is in{' '}
        <Link to="/blog/eidos-an-architecture-for-cheap-code">the essay</Link>; the
        specification is below.
      </p>

      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {docs.map((doc, i) => (
            <Link
              key={doc.slug}
              to={`/eidos/${doc.slug}`}
              style={{
                display: 'block',
                padding: '1.5rem',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-gear-stroke)',
                borderRadius: '8px',
                transition: 'background 0.2s, border-color 0.2s',
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
              <span style={{
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--color-text-muted)',
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: '0.3rem 0', color: 'var(--color-text)' }}>
                {doc.frontmatter.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {doc.frontmatter.summary}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
