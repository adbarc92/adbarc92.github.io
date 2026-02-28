import { useEffect, useState } from 'react';
import { loadBlogPosts, type ContentEntry, type BlogFrontmatter } from '../lib/content';
import BlogCard from '../components/BlogCard';

export default function Blog() {
  const [posts, setPosts] = useState<ContentEntry<BlogFrontmatter>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts().then(p => { setPosts(p); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Blog</h1>
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : posts.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No posts yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map(post => (
            <BlogCard key={post.slug} slug={post.slug} frontmatter={post.frontmatter} />
          ))}
        </div>
      )}
    </div>
  );
}
