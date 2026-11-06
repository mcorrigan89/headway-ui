// The theme's colours. Kept apart from build-registry.mjs so tests can check
// them (tests/contrast.test.ts).
//
// Literal values only: the shadcn CLI maps a color token to --color-<name>
// in @theme, but a var(...) value to a self-referencing --<name>, which would
// leave bg-primary and friends undefined.

// The route colours, as the MTA publishes them. They are identity and status,
// never body text: on the dark ground several fall below 4.5:1.
export const LINES = {
  'line-blue': '#0039a6', // A C E
  'line-orange': '#ff6319', // B D F M
  'line-lime': '#6cbe45', // G
  'line-brown': '#996633', // J Z
  'line-grey': '#a7a9ac', // L
  'line-yellow': '#fccc0a', // N Q R W
  'line-red': '#ee352e', // 1 2 3
  'line-green': '#00933c', // 4 5 6
  'line-purple': '#b933ad', // 7
  'line-shuttle': '#808183', // S
};

// Dark is the default: white type on black, as on the signs. A light palette
// will sit beside this one under :root[data-mode="light"].
export const PALETTE = {
  // the page is charcoal so a black sign band reads against it
  background: '#1a1a1a',
  foreground: '#f5f5f5',
  card: '#222222',
  'card-foreground': '#f5f5f5',
  popover: '#222222',
  'popover-foreground': '#f5f5f5',
  // the main action is a white panel with black type: the strongest thing on
  // a dark page
  primary: '#ffffff',
  'primary-foreground': '#111111',
  secondary: '#2e2e2e',
  'secondary-foreground': '#f5f5f5',
  muted: '#262626',
  'muted-foreground': '#a3a3a3',
  accent: '#333333',
  'accent-foreground': '#ffffff',
  border: '#3a3a3a',
  input: '#555555',
  // focus is the N/Q/R/W yellow: unmistakable on black and white alike
  ring: '#fccc0a',
  // the sign band and its rule
  sign: '#0b0b0b',
  'sign-foreground': '#ffffff',
  'sign-rule': '#ffffff',
  // status. Fills carry text, so each is deepened from its line colour just
  // enough for its foreground to pass AA.
  ok: '#007a33',
  'ok-foreground': '#ffffff',
  warning: '#fccc0a',
  'warning-foreground': '#111111',
  destructive: '#d11a1a',
  'destructive-foreground': '#ffffff',
  info: '#0039a6',
  'info-foreground': '#ffffff',
  ...LINES,
  radius: '0rem',
};

// text-on-surface pairs that must meet WCAG AA (4.5:1)
export const TEXT_PAIRS = [
  ['foreground', 'background'],
  ['foreground', 'card'],
  ['foreground', 'muted'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['muted-foreground', 'muted'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['primary-foreground', 'primary'],
  ['secondary-foreground', 'secondary'],
  ['accent-foreground', 'accent'],
  ['sign-foreground', 'sign'],
  ['ok-foreground', 'ok'],
  ['warning-foreground', 'warning'],
  ['destructive-foreground', 'destructive'],
  ['info-foreground', 'info'],
];

// WCAG relative luminance and contrast ratio, for hex colours
export function contrast(a, b) {
  const lum = (hex) => {
    const [r, g, bl] = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
