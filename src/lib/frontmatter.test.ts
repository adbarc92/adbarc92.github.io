import { describe, it, expect } from 'vitest';
import { isPublished, CATEGORIES } from './frontmatter';

describe('isPublished', () => {
  it('hides a draft when drafts are not being shown', () => {
    expect(isPublished({ draft: true }, false)).toBe(false);
  });

  it('shows a draft when they are — the dev server', () => {
    expect(isPublished({ draft: true }, true)).toBe(true);
  });

  it('treats an absent draft flag as published', () => {
    expect(isPublished({}, false)).toBe(true);
  });

  it('treats draft: false as published', () => {
    expect(isPublished({ draft: false }, false)).toBe(true);
  });
});

describe('CATEGORIES', () => {
  it('has no duplicate ids, which would split a filter in two', () => {
    const ids = CATEGORIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every category a label', () => {
    expect(CATEGORIES.every(c => c.label.length > 0)).toBe(true);
  });
});
