import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadProject, type ContentEntry, type ProjectFrontmatter } from '../lib/content';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<ContentEntry<ProjectFrontmatter> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    loadProject(slug).then(p => { setProject(p); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Project not found.</p>
        <Link to="/projects" style={{ marginTop: '1rem', display: 'inline-block' }}>Back to Projects</Link>
      </div>
    );
  }

  const { frontmatter, html } = project;

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '48rem', margin: '0 auto' }}>
      <Link to="/projects" style={{
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        display: 'inline-block',
        marginBottom: '2rem',
      }}>
        &larr; Back to Projects
      </Link>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        {frontmatter.title}
      </h1>
      <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
        {frontmatter.description}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {frontmatter.tags.map(tag => (
          <span key={tag} style={{
            fontSize: '0.75rem',
            color: 'var(--color-accent)',
            background: 'var(--color-accent-dim)',
            padding: '0.15rem 0.5rem',
            borderRadius: '3px',
          }}>
            {tag}
          </span>
        ))}
      </div>
      {frontmatter.links && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {frontmatter.links.github && (
            <a href={frontmatter.links.github} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.85rem' }}>
              GitHub &rarr;
            </a>
          )}
          {frontmatter.links.live && (
            <a href={frontmatter.links.live} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.85rem' }}>
              Live Demo &rarr;
            </a>
          )}
        </div>
      )}
      <article
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
