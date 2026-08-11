interface Props {
  draft?: boolean;
  /** Spacing below the badge; differs between the card and the post header. */
  marginBottom?: string;
}

/** Dev-only marker so a draft read in `npm run dev` is never mistaken for live. */
export default function DraftBadge({ draft, marginBottom = '0.5rem' }: Props) {
  if (!import.meta.env.DEV || !draft) return null;

  return (
    <span style={{
      display: 'inline-block',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: '#0f1117',
      background: 'var(--color-accent)',
      padding: '0.1rem 0.4rem',
      borderRadius: '3px',
      marginBottom,
    }}>
      DRAFT
    </span>
  );
}
