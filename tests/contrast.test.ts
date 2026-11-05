// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { contrast, PALETTE, TEXT_PAIRS } from '../scripts/palette.mjs';

const palette = PALETTE as Record<string, string>;

describe('palette contrast', () => {
  it.each(TEXT_PAIRS)('%s on %s meets WCAG AA', (fg, bg) => {
    expect(contrast(palette[fg], palette[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the focus ring visible against the ground and a sign', () => {
    expect(contrast(palette.ring, palette.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(palette.ring, palette.sign)).toBeGreaterThanOrEqual(3);
  });

  it('keeps sign bands distinct from the ground and cards', () => {
    expect(palette.sign).not.toBe(palette.background);
    expect(palette.sign).not.toBe(palette.card);
  });
});
