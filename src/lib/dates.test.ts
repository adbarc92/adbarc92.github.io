import { describe, it, expect } from 'vitest';
import { formatDate } from './dates';

describe('formatDate', () => {
  it('renders the authored calendar day rather than the local-time one', () => {
    // Regression guard: new Date('2026-08-10') is UTC midnight, so formatting in
    // local time renders "August 9" anywhere west of Greenwich.
    expect(formatDate('2026-08-10')).toBe('August 10, 2026');
    expect(formatDate('2026-02-27')).toBe('February 27, 2026');
  });

  it('accepts a Date, because the YAML parser resolves an unquoted date to one', () => {
    expect(formatDate(new Date('2026-08-10T00:00:00Z'))).toBe('August 10, 2026');
  });

  it('does not slip across a year boundary', () => {
    expect(formatDate('2026-01-01')).toBe('January 1, 2026');
    expect(formatDate('2026-12-31')).toBe('December 31, 2026');
  });
});
