import { CATEGORIES, type Category } from '../lib/content';

interface Props {
  counts: Partial<Record<Category, number>>;
  active: Category | null;
  total: number;
  onSelect: (category: Category | null) => void;
}

const chipStyle = (selected: boolean): React.CSSProperties => ({
  fontSize: '0.8rem',
  fontWeight: 500,
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  padding: '0.3rem 0.7rem',
  borderRadius: '999px',
  cursor: 'pointer',
  background: selected ? 'var(--color-accent-dim)' : 'transparent',
  color: selected ? 'var(--color-accent)' : 'var(--color-text-muted)',
  border: `1px solid ${selected ? 'var(--color-accent-dim)' : 'var(--color-gear-stroke)'}`,
  transition: 'color 0.2s, background 0.2s, border-color 0.2s',
});

export default function CategoryFilter({ counts, active, total, onSelect }: Props) {
  // Only categories that actually have posts get a chip, so the taxonomy can be
  // declared ahead of the writing without advertising empty rooms.
  const present = CATEGORIES.filter(c => (counts[c.id] ?? 0) > 0);
  if (present.length < 2) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
      <button type="button" style={chipStyle(active === null)} onClick={() => onSelect(null)}>
        All ({total})
      </button>
      {present.map(c => (
        <button
          type="button"
          key={c.id}
          style={chipStyle(active === c.id)}
          onClick={() => onSelect(c.id)}
        >
          {c.label} ({counts[c.id]})
        </button>
      ))}
    </div>
  );
}
