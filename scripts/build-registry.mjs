// Writes registry.json from the item list below, then runs `shadcn build`,
// which inlines each file's source into public/r/<name>.json — what
// `npx shadcn add <url>` installs. REGISTRY_URL is where public/r will be
// served (items reference each other by URL).
import { execFileSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import { themeCss } from './theme-css.mjs';
import { PALETTE } from './palette.mjs';

const BASE = (process.env.REGISTRY_URL ?? 'http://localhost:5173').replace(/\/+$/, '');
const url = (name) => `${BASE}/r/${name}.json`;

const THEME = url('theme');
const UTILS = url('utils');

// ── the theme: tokens, fonts, utilities ───────────────────────────────────
const theme = {
  name: 'theme',
  type: 'registry:theme',
  title: 'Headway theme',
  description:
    'The palette, type and utilities everything else uses: white type on black sign bands over a charcoal ground, the ten route colours, and status colours drawn from them. Square corners throughout.',
  dependencies: ['@fontsource-variable/inter', 'tw-animate-css', 'shadcn'],
  cssVars: {
    theme: {
      // Helvetica where the system has it (the signs' face); Inter, which
      // ships with the theme, everywhere else
      'font-sans': "'Helvetica Neue', Helvetica, 'Inter Variable', Arial, sans-serif",
      'font-mono': "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
    },
    // dark only for now: the same palette either way
    light: PALETTE,
    dark: PALETTE,
  },
  css: {
    '@import "tw-animate-css"': {},
    '@import "shadcn/tailwind.css"': {},
    '@import "@fontsource-variable/inter"': {},
    ':root': { 'color-scheme': 'dark' },
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
const UI = {
  alert: {
    description: 'A service-status notice: good service, delays, planned work or suspended, with an icon on a tile of its colour.',
    deps: ['class-variance-authority'],
  },
  arrow: { description: 'The signage arrow, in eight directions.', deps: [] },
  badge: { description: 'A small square label, in black, white or a status colour.', deps: ['@base-ui/react', 'class-variance-authority'] },
  button: {
    description: 'Square buttons: a white primary, a black sign band, outline, ghost, destructive and link.',
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
  items: [theme, utils, ...uiItems],
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
