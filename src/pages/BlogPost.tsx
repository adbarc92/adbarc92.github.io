import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadBlogPost, type ContentEntry, type BlogFrontmatter } from '../lib/content';
import { formatDate } from '../lib/dates';
import DraftBadge from '../components/DraftBadge';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<ContentEntry<BlogFrontmatter> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    loadBlogPost(slug).then(p => { setPost(p); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Post not found.</p>
        <Link to="/blog" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Blog</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <Link to="/blog" style={{
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        display: 'inline-block',
        marginBottom: '2rem',
      }}>
        &larr; Back to Blog
      </Link>
      <DraftBadge draft={post.frontmatter.draft} marginBottom="0.75rem" />
      <time style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
        {formatDate(post.frontmatter.date)}
      </time>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
        {post.frontmatter.title}
      </h1>
      {post.frontmatter.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {post.frontmatter.tags.map(tag => (
            <Link
              key={tag}
              to={`/blog?tag=${encodeURIComponent(tag)}`}
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-accent)',
                background: 'var(--color-accent-dim)',
                padding: '0.15rem 0.5rem',
                borderRadius: '3px',
              }}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: post.html }}
      />
    </div>
  );
}
