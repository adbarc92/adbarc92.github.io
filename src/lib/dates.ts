/**
 * Frontmatter dates are calendar days. `new Date('2026-08-10')` parses to UTC
 * midnight, so formatting in local time renders the previous day anywhere west
 * of Greenwich. Formatting in UTC is what keeps the printed date the authored one.
 *
 * The parameter accepts Date because the YAML parser resolves unquoted
 * `2026-08-10` to a Date, not a string, despite the frontmatter types.
 */
export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(value instanceof Date ? value : new Date(value));
}
