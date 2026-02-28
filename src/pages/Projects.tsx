import { useEffect, useState } from 'react';
import { loadProjects, type ContentEntry, type ProjectFrontmatter } from '../lib/content';
import ProjectCard from '../components/ProjectCard';

export default function Projects() {
  const [projects, setProjects] = useState<ContentEntry<ProjectFrontmatter>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects().then(p => { setProjects(p); setLoading(false); });
  }, []);

  return (
    <div style={{ padding: '6rem 2rem 2rem', maxWidth: '64rem', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Projects</h1>
      {loading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
      ) : projects.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No projects yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}>
          {projects.map(project => (
            <ProjectCard key={project.slug} slug={project.slug} frontmatter={project.frontmatter} />
          ))}
        </div>
      )}
    </div>
  );
}
