// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { contrast, LIGHT, LIGHT_TEXT_PAIRS, PALETTE, PANEL, TEXT_PAIRS } from '../scripts/palette.mjs';

const dark = PALETTE as Record<string, string>;
const light = LIGHT as Record<string, string>;
const panel = PANEL as Record<string, string>;

describe('dark palette contrast', () => {
  it.each(TEXT_PAIRS)('%s on %s meets WCAG AA', (fg, bg) => {
    expect(contrast(dark[fg], dark[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the focus ring visible against the ground and a sign', () => {
    expect(contrast(dark.ring, dark.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(dark.ring, dark.sign)).toBeGreaterThanOrEqual(3);
  });

  it('keeps sign bands distinct from the ground and cards', () => {
    expect(dark.sign).not.toBe(dark.background);
    expect(dark.sign).not.toBe(dark.card);
  });
});

describe('light palette contrast', () => {
  it.each(LIGHT_TEXT_PAIRS)('%s on %s meets WCAG AA', (fg, bg) => {
    expect(contrast(light[fg], light[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the focus ring visible on the wall', () => {
    expect(contrast(light.ring, light.background)).toBeGreaterThanOrEqual(3);
  });

  it('makes cards black panels on a white wall', () => {
    expect(contrast(light.card, light.background)).toBeGreaterThanOrEqual(15);
  });
});

// inside an on-sign panel, the panel's own background is the mode's card or
// sign colour, and the text and ring come from PANEL
describe.each([
  ['dark', dark],
  ['light', light],
])('on-sign panels in %s mode', (_, mode) => {
  it.each([
    ['foreground', 'card'],
    ['muted-foreground', 'card'],
    ['foreground', 'sign'],
    ['muted-foreground', 'sign'],
    ['error', 'card'],
    ['primary-foreground', 'primary'],
    ['secondary-foreground', 'secondary'],
  ])('%s on %s meets WCAG AA', (fg, bg) => {
    const surface = bg in panel ? panel[bg] : mode[bg];
    expect(contrast(panel[fg], surface)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'])('%s reads on the panel', (series) => {
    expect(contrast(mode[series], mode.card)).toBeGreaterThanOrEqual(3);
  });

  it('keeps the focus ring visible on the panel', () => {
    expect(contrast(dark.ring, mode.card)).toBeGreaterThanOrEqual(3);
    expect(contrast(dark.ring, mode.sign)).toBeGreaterThanOrEqual(3);
  });
});
