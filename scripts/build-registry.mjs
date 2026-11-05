// Writes registry.json from the item list below, then runs `shadcn build`,
// which inlines each file's source into public/r/<name>.json — what
// `npx shadcn add <url>` installs. REGISTRY_URL is where public/r will be
// served (items reference each other by URL).
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { themeCss } from './theme-css.mjs';
import { LIGHT, PALETTE, PANEL } from './palette.mjs';

const BASE = (process.env.REGISTRY_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
const url = (name) => `${BASE}/r/${name}.json`;

const THEME = url('theme');
const UTILS = url('utils');

// a palette as custom properties, for plain CSS rules
const vars = (palette) => Object.fromEntries(Object.entries(palette).map(([k, v]) => [`--${k}`, v]));

// ── the theme: tokens, fonts, utilities ───────────────────────────────────
const theme = {
  name: 'theme',
  type: 'registry:theme',
  title: 'Headway theme',
  description:
    'The palette, type and utilities everything else uses: white type on black sign bands, over a charcoal ground in dark mode or a white wall in light, with the ten route colours and status colours drawn from them. Square corners throughout.',
  dependencies: ['@fontsource-variable/inter', 'tw-animate-css', 'shadcn'],
  cssVars: {
    theme: {
      // Helvetica where the system has it (the signs' face); Inter, which
      // ships with the theme, everywhere else
      'font-sans': "'Helvetica Neue', Helvetica, 'Inter Variable', Arial, sans-serif",
      'font-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    },
    // shadcn writes these to :root; light mode is a data-mode attribute
    // (below), so both are the dark palette
    light: PALETTE,
    dark: PALETTE,
  },
  css: {
    '@import "tw-animate-css"': {},
    '@import "shadcn/tailwind.css"': {},
    '@import "@fontsource-variable/inter"': {},
    ':root': { 'color-scheme': 'dark' },
    // dark is the default; data-mode="light" on <html> pins light, and
    // data-mode="system" follows the OS
    ':root[data-mode="light"]': { 'color-scheme': 'light', ...vars(LIGHT) },
    '@media (prefers-color-scheme: light)': {
      ':root[data-mode="system"]': { 'color-scheme': 'light', ...vars(LIGHT) },
    },
    '@layer base': {
      '*': { '@apply border-border outline-ring/50': {} },
      body: { '@apply bg-background text-foreground antialiased': {} },
      html: { '@apply font-sans': {} },
    },
    // the sign band: white type, bold and tight, on black
    '@utility sign': {
      'background-color': 'var(--sign)',
      color: 'var(--sign-foreground)',
      'font-weight': '700',
      'letter-spacing': '-0.01em',
      'line-height': '1.15',
    },
    // a black panel that carries text: inside it, text, controls and the
    // focus ring take the dark palette's colours in either mode. Cards,
    // alerts, tables and the tab bar use it.
    '@utility on-sign': { ...vars(PANEL), color: 'var(--foreground)' },
    // the thin white rule just inside the top edge of a sign. Padding makes
    // room so content never touches it.
    '@utility sign-rule': {
      'background-image': 'linear-gradient(var(--sign-rule), var(--sign-rule))',
      'background-repeat': 'no-repeat',
      'background-size': '100% 2px',
      'background-position': '0 6px',
      'padding-top': 'calc(6px + 2px + 0.5rem)',
    },
  },
};

const utils = {
  name: 'utils',
  type: 'registry:lib',
  title: 'Utils',
  description: 'cn(): merges class names, letting later Tailwind classes win.',
  dependencies: ['clsx', 'tailwind-merge'],
  files: [{ path: 'registry/headway/lib/utils.ts', type: 'registry:lib' }],
};

// ── base components ────────────────────────────────────────────────────────
// name → { description, deps (npm), ui (other registry items it imports) }
// ── hooks ──────────────────────────────────────────────────────────────────
const HOOKS = {
  'use-color-mode': {
    title: 'useColorMode',
    description: 'Dark (the default), light, or follow the OS, on <html data-mode>, remembered between visits.',
  },
};
const hookItems = Object.entries(HOOKS).map(([name, spec]) => ({
  name,
  type: 'registry:hook',
  title: spec.title,
  description: spec.description,
  files: [{ path: `registry/headway/hooks/${name}.ts`, type: 'registry:hook' }],
}));

const UI = {
  alert: {
    description: 'A service-status notice: good service, delays, planned work or suspended, with an icon on a tile of its colour.',
    deps: ['class-variance-authority'],
  },
  arrow: { description: 'The signage arrow, in eight directions.', deps: [] },
  badge: { description: 'A small square label, in black, white or a status colour.', deps: ['@base-ui/react', 'class-variance-authority'] },
  button: {
    description:
      'Square buttons: a primary panel (white on the dark ground, black on the light wall), secondary, outline, ghost, destructive and link.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  card: { description: 'A square panel with header, title, description, content and footer; the header can be a sign band.', deps: [] },
  field: {
    description: 'Labels, controls, help text and errors composed into form fields; takes errors from any form library.',
    deps: ['class-variance-authority'],
    ui: ['label'],
  },
  input: { description: 'A square text box: a black well whose edge turns white on focus.', deps: ['@base-ui/react'] },
  label: { description: 'A bold form label.', deps: [] },
  'route-bullet': {
    description: 'A coloured circle with a route letter or number, or a diamond for express service. Name a route and its colour follows.',
    deps: ['class-variance-authority'],
  },
  sign: {
    description: 'The sign band: white type on black under a thin white rule, with route bullets and an arrow beside the words.',
    deps: ['class-variance-authority'],
  },
  'strip-map': {
    description:
      'The line diagram from inside the train, as a stepper or timeline: stops on a line in its route colour, with passed stops gone dark.',
    deps: [],
    ui: ['route-bullet'],
  },
  table: { description: 'A plain, dense table with a black header band and tabular numbers.', deps: [] },
  tabs: {
    description: 'Tabs on a black band with the chosen one lit white, or a quieter line under the chosen tab.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
};
const uiItems = Object.entries(UI).map(([name, spec]) => ({
  name,
  type: 'registry:ui',
  title: name.replace(/(^|-)(\w)/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase()),
  description: spec.description,
  dependencies: spec.deps,
  registryDependencies: [THEME, UTILS, ...(spec.ui ?? []).map(url)],
  files: [{ path: `registry/headway/ui/${name}.tsx`, type: 'registry:ui' }],
}));

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'headway',
  homepage: BASE,
  items: [theme, utils, ...hookItems, ...uiItems],
};

// every file an item names must exist
for (const item of registry.items) {
  for (const f of item.files ?? []) {
    if (!existsSync(f.path)) throw new Error(`${item.name}: missing ${f.path}`);
  }
}
writeFileSync('registry.json', JSON.stringify(registry, null, 2) + '\n');
// the preview's copy of the theme, from the same source
writeFileSync('src/theme.generated.css', `/* generated by scripts/build-registry.mjs — do not edit */\n${themeCss([theme])}`);
// the item list the preview renders
writeFileSync(
  'src/items.generated.json',
  JSON.stringify(
    registry.items.map(({ name, type, title, description }) => ({ name, type, title, description })),
    null,
    2,
  ) + '\n',
);
execFileSync('npx', ['shadcn', 'build', '--output', 'public/r'], { stdio: 'inherit' });
console.log(`registry: ${registry.items.length} items → public/r (base ${BASE})`);
