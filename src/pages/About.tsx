import { useEffect, useState } from 'react';
import { marked } from 'marked';

export default function About() {
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const modules = import.meta.glob<string>('/content/about.md', {
      query: '?raw',
      import: 'default',
    });

    const loader = Object.values(modules)[0];
    if (!loader) {
      setLoading(false);
      return;
    }

    loader().then(raw => {
      const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
      const body = match ? match[2] : raw;
      setHtml(marked.parse(body) as string);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <article
        style={{ lineHeight: 1.8, color: 'var(--color-text)' }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
