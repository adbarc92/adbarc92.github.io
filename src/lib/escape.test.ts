import { describe, it, expect } from 'vitest';
import { escapeAttr, escapeXml } from './escape';

describe('escapeAttr', () => {
  it('prevents a quote in a title from breaking out of an attribute', () => {
    expect(escapeAttr('He said "hello"')).toBe('He said &quot;hello&quot;');
  });

  it('escapes an ampersand once, not twice', () => {
    // "Form Template & Gate Registry" is a real document title.
    expect(escapeAttr('Form Template & Gate Registry'))
      .toBe('Form Template &amp; Gate Registry');
  });

  it('escapes angle brackets so markup cannot be injected through a description', () => {
    expect(escapeAttr('<script>')).toBe('&lt;script&gt;');
  });
});

describe('escapeXml', () => {
  it('escapes apostrophes, which escapeAttr leaves alone', () => {
    expect(escapeXml("a human's attention")).toBe('a human&apos;s attention');
  });

  it('escapes an ampersand once, not twice', () => {
    expect(escapeXml('Form Template & Gate Registry'))
      .toBe('Form Template &amp; Gate Registry');
  });

  it('leaves ordinary text untouched', () => {
    expect(escapeXml('Eidos: An Architecture for Cheap Code'))
      .toBe('Eidos: An Architecture for Cheap Code');
  });
});
