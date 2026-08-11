import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadEidosDocs, type ContentEntry, type EidosFrontmatter } from '../lib/content';
import { pageTitle } from '../lib/site';

export default function EidosDoc() {
  const { slug } = useParams<{ slug: string }>();
  const [docs, setDocs] = useState<ContentEntry<EidosFrontmatter>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEidosDocs().then(d => { setDocs(d); setLoading(false); });
  }, []);

  const index = docs.findIndex(d => d.slug === slug);
  const doc = index >= 0 ? docs[index] : null;
  const prev = index > 0 ? docs[index - 1] : null;
  const next = index >= 0 && index < docs.length - 1 ? docs[index + 1] : null;

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '60rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!doc) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '60rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Document not found.</p>
        <Link to="/eidos" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Eidos</Link>
      </div>
    );
  }

  return (
    <div style={{
      padding: '6rem 2rem 2rem',
      maxWidth: '60rem',
      margin: '0 auto',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '3rem',
      alignItems: 'flex-start',
    }}>
      <title>{pageTitle(doc.frontmatter.title)}</title>
      <meta name="description" content={doc.frontmatter.summary} />
      <nav style={{ flex: '1 1 11rem', minWidth: '11rem', position: 'sticky', top: '6rem' }}>
        <Link to="/eidos" style={{
          fontSize: '0.75rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
        }}>
          Eidos v{doc.frontmatter.version}
        </Link>
        <ol style={{ listStyle: 'none', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {docs.map(d => (
            <li key={d.slug}>
              <Link
                to={`/eidos/${d.slug}`}
                style={{
                  fontSize: '0.85rem',
                  lineHeight: 1.4,
                  color: d.slug === doc.slug ? 'var(--color-accent)' : 'var(--color-text-muted)',
                }}
              >
                {d.frontmatter.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div style={{ flex: '1 1 30rem', minWidth: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>
          {doc.frontmatter.title}
        </h1>
        <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '1rem',
          marginTop: '4rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--color-gear-stroke)',
          fontSize: '0.85rem',
        }}>
          <span>{prev && <Link to={`/eidos/${prev.slug}`}>&larr; {prev.frontmatter.title}</Link>}</span>
          <span>{next && <Link to={`/eidos/${next.slug}`}>{next.frontmatter.title} &rarr;</Link>}</span>
        </div>
      </div>
    </div>
  );
}
