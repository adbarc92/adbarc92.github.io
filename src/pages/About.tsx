import { useEffect, useState } from 'react';
import { parseMarkdown } from '../lib/markdown';
import { pageTitle, SITE } from '../lib/site';

const modules = import.meta.glob<string>('/content/about.md', {
  query: '?raw',
  import: 'default',
});
const loader = Object.values(modules)[0];

export default function About() {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(!!loader);

  useEffect(() => {
    if (!loader) return;

    loader().then(raw => {
      setHtml(parseMarkdown(raw).html);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <title>{pageTitle('About')}</title>
        <meta name="description" content={SITE.description} />
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <title>{pageTitle('About')}</title>
      <meta name="description" content={SITE.description} />
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
