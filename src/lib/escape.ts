/**
 * Escaping for generated HTML attributes and XML text. Pure — imported by both
 * the app-side modules and scripts/prerender.ts, so no import.meta, no side effects.
 *
 * Ampersand is replaced first in both, otherwise the ampersands introduced by the
 * later replacements would themselves be escaped.
 */

export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
