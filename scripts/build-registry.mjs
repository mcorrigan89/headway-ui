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
    // focus ring take the dark palette's colours in either mode. The ring is
    // set on the panel's contents, so the panel's own ring (an input group)
    // still reads against the wall around it. Cards,
    // alerts, tables and the tab bar use it.
    '@utility on-sign': { ...vars(PANEL), color: 'var(--foreground)', '& *': { '--ring': PALETTE.ring } },
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
  'use-hotkeys': {
    title: 'useHotkeys',
    description:
      'Single-key shortcuts for a screen that stay out of the way: not while typing, inside a dialog or with a modifier held, unless the binding asks for one.',
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
  accordion: {
    description: 'Stacked sections that open and close: bold headings between heavy rules, a plus that turns to a minus when open.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  alert: {
    description: 'A service-status notice: good service, delays, planned work or suspended, with an icon on a tile of its colour.',
    deps: ['class-variance-authority'],
  },
  'alert-dialog': {
    description: 'A confirmation that has to be answered, on a black panel with the sign’s white rule along its top.',
    deps: ['@base-ui/react'],
    ui: ['button'],
  },
  arrow: { description: 'The signage arrow, in eight directions.', deps: [] },
  'aspect-ratio': { description: 'Holds its content to a fixed shape, such as 16:9, whatever the width.', deps: [] },
  avatar: {
    description:
      'A person in a circle, like a route bullet: their photo, or bold initials until it loads, with an optional status dot and stacked groups.',
    deps: ['@base-ui/react'],
  },
  badge: { description: 'A small square label, in black, white or a status colour.', deps: ['@base-ui/react', 'class-variance-authority'] },
  banner: {
    description:
      'A full-width service notice band, like a planned-work notice: a black sign band under the white rule or a solid status fill, a bold line with route bullets, an action, folding details and a remembered dismiss.',
    deps: ['class-variance-authority', 'lucide-react'],
    ui: ['route-bullet'],
  },
  breadcrumb: {
    description: 'Where this page sits: the steps before in grey, the current page in bold, with signage arrows between.',
    deps: ['@base-ui/react', 'lucide-react'],
    ui: ['arrow'],
  },
  'busy-hold': {
    description:
      'Holds a region still while slow work runs: its controls disabled and dimmed but readable, under a black-panel status line with a white rail, the spinner, a bold label and the time so far.',
    deps: [],
    ui: ['spinner'],
  },
  button: {
    description:
      'Square buttons: a primary panel (white on the dark ground, black on the light wall), secondary, outline, ghost, destructive and link.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  'button-group': {
    description: 'Buttons, inputs and selects butted together into one square strip, with text plates and separators.',
    deps: ['@base-ui/react', 'class-variance-authority'],
    ui: ['separator'],
  },
  calendar: {
    description: 'A month grid on a black panel: square days, today bold and underlined, the chosen day lit, a range on grey.',
    deps: ['react-day-picker', 'lucide-react'],
    ui: ['button'],
  },
  card: { description: 'A square panel with header, title, description, content and footer; the header can be a sign band.', deps: [] },
  carousel: {
    description: 'A strip of slides you swipe, drag or step through with square buttons carrying the signage arrow.',
    deps: ['embla-carousel-react'],
    ui: ['button', 'arrow'],
  },
  chart: {
    description: 'Recharts on a black panel, in five route colours chosen to read on black, with a white crosshair and a black tooltip.',
    deps: ['recharts'],
  },
  checkbox: {
    description: 'A square box with a heavy edge that fills solid, with the tick knocked out, when checked.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  collapsible: { description: 'An unstyled section that shows and hides behind a trigger.', deps: ['@base-ui/react'] },
  combobox: {
    description: 'A select you can type into to filter: a black text box over a black panel of matches, with chips for several values.',
    deps: ['@base-ui/react', 'lucide-react'],
    ui: ['button', 'input-group'],
  },
  command: {
    description: 'A searchable list of commands in a black panel, inline or as a ⌘K palette in a dialog.',
    deps: ['cmdk', 'lucide-react'],
    ui: ['dialog', 'input-group'],
  },
  'confirm-dialog': {
    description:
      '"Are you sure?" in one call, on the alert dialog\'s black panel under the white rule: Cancel has focus, a destructive confirm gets a red tile and action, it stays pending while the action runs and shows the failure in red; also an imperative confirm() with <ConfirmDialogHost />.',
    deps: ['lucide-react'],
    ui: ['alert-dialog', 'spinner'],
  },
  'context-menu': {
    description: 'The dropdown menu’s black panel, opened by right-click or long-press over an area.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  'copy-button': {
    description: 'A button that copies a value, turns to a tick and “Copied” for a moment, and announces it.',
    deps: ['lucide-react'],
    ui: ['button'],
  },
  'date-picker': {
    description: 'One date, picked from a calendar in a black popover, behind a black-box trigger like a text input.',
    deps: ['lucide-react'],
    ui: ['calendar', 'popover'],
  },
  'date-range-picker': {
    description: 'A start–end range from presets or a two-month calendar in a black popover, behind a black-box trigger.',
    deps: ['lucide-react'],
    ui: ['calendar', 'input', 'popover'],
  },
  deadline: {
    description:
      'A deadline said as what is left or how late ("3 days left", "2 days late"), with a square status mark or as a tone badge, on a <time>.',
    deps: ['lucide-react', 'class-variance-authority'],
    ui: ['tone-badge'],
  },
  'description-list': {
    description:
      'Label → value facts in a real <dl>, stacked, inline or in a grid, with bold muted labels, tabular values and optional sources.',
    deps: ['class-variance-authority'],
    ui: ['quick-tip'],
  },
  dialog: {
    description: 'A modal on a black panel with the sign’s white rule along its top.',
    deps: ['@base-ui/react', 'lucide-react'],
    ui: ['button'],
  },
  distribution: {
    description: 'One bar on a black band split by share in chart, status or route colours, with a square-swatch legend.',
    deps: [],
  },
  'download-link': {
    description:
      'A file that may still be being made: a spinner while preparing, then a bold underlined link with its size, or a red error with Retry.',
    deps: ['lucide-react'],
    ui: ['button', 'spinner'],
  },
  drawer: {
    description: 'A black panel that slides in from an edge and can be swiped away: the bottom sheet on phones.',
    deps: ['@base-ui/react'],
  },
  'dropdown-menu': {
    description: 'A menu in a black panel under its trigger: a grey band on the highlighted item, white ticks, red destructive items.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  empty: {
    description: 'Nothing here yet: a dashed frame with an icon on a white tile, a bold title, a line of explanation and what to do next.',
    deps: ['class-variance-authority'],
  },
  'error-page': {
    description:
      'What a page shows when it breaks or nothing is there: a station sign reading "404 · Not found" with the icon on a status tile, a large bold title, a way back, and the technical details folded away.',
    deps: ['lucide-react'],
    ui: ['button', 'collapsible', 'sign'],
  },
  'event-log': {
    description:
      'An activity timeline: a heavy rule with square status nodes, solid source badges, fade-in for new events and a source filter.',
    deps: ['class-variance-authority'],
    ui: ['badge', 'toggle-group'],
  },
  field: {
    description: 'Labels, controls, help text and errors composed into form fields; takes errors from any form library.',
    deps: ['class-variance-authority'],
    ui: ['label'],
  },
  'file-upload': {
    description:
      'A black drop zone with a dashed edge, or an outline button, over a list of chosen files with progress, errors and remove.',
    deps: ['lucide-react'],
    ui: ['button', 'progress'],
  },
  highlight: {
    description: 'Search matches marked as solid panels that hold contrast in both modes, with snippets and a SearchHit result row.',
    deps: [],
  },
  'hover-card': {
    description: 'A preview in a black panel on hover; a shortcut, never the only way to the information.',
    deps: ['@base-ui/react'],
  },
  input: { description: 'A square text box: a black well whose edge turns white on focus.', deps: ['@base-ui/react'] },
  'input-group': {
    description: 'An input with icons, units or buttons attached, in one black box.',
    deps: ['@base-ui/react', 'class-variance-authority'],
    ui: ['button'],
  },
  'input-otp': {
    description: 'A one-time code entered one character per black box, in groups.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  item: {
    description: 'A row in a list: media, a bold title and description, and actions; it can be a link, or sit in a black panel.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  kbd: { description: 'A keyboard key as a small square in monospace type, alone or grouped into a shortcut.', deps: [] },
  'key-hints': {
    description: "The legend of a screen's shortcuts: square keycaps and what they do, in small muted type, as a labelled list.",
    deps: [],
    ui: ['kbd'],
  },
  label: { description: 'A bold form label.', deps: [] },
  lightbox: {
    description:
      "An image seen large in the dialog's black panel: fit, 100% and stepped zoom in a black well, regions drawn as flat yellow frames edged in black, and Previous / Next (or arrow keys) through a set.",
    deps: ['lucide-react'],
    ui: ['button', 'dialog', 'spinner'],
  },
  link: {
    description:
      'A text link in the text colour with a heavy underline that thickens on hover; external links open in a new tab with an arrow.',
    deps: ['@base-ui/react', 'class-variance-authority', 'lucide-react'],
  },
  markdown: {
    description:
      'Markdown with GitHub extensions, set in place: bold tight headings, underlined links with the yellow focus ring, mono code, a heavy rule on quotes and tables on a black panel under a sign band; raw HTML is dropped.',
    deps: ['react-markdown', 'remark-gfm'],
  },
  menubar: {
    description: 'A strip of menus on a black sign band; the open menu’s name is lit.',
    deps: ['@base-ui/react'],
    ui: ['dropdown-menu'],
  },
  meter: {
    description: 'An n-of-m count as a row of square segments in the panel colour or a status fill, with an accessible meter role.',
    deps: [],
  },
  'native-select': {
    description: 'The browser’s own select in a black box, for long lists, phones and forms that work without JavaScript.',
    deps: ['lucide-react'],
  },
  'navigation-menu': {
    description: 'Site navigation: bold triggers that open a black panel of links, with the open trigger lit.',
    deps: ['@base-ui/react', 'class-variance-authority', 'lucide-react'],
  },
  'number-input': {
    description: 'A number in a black box with a unit inside and square steppers on its edge, clamped to min and max.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  'page-header': {
    description:
      'The top of a page like a station sign: a small bold label or route bullets, a big bold title with a count badge, and a black search box beside the actions; plus PageSection, a titled black panel.',
    deps: ['lucide-react'],
    ui: ['badge', 'input-group'],
  },
  pagination: {
    description: 'Previous, numbered pages and next, with the current page a lit panel.',
    deps: ['lucide-react'],
    ui: ['button'],
  },
  popover: { description: 'Content in a black panel, anchored to its trigger.', deps: ['@base-ui/react'] },
  progress: {
    description: 'A thick square bar for work under way, in the primary or a status colour; it pulses when the length is unknown.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  'query-state': {
    description:
      'Loading, failed and empty said the same way everywhere: the station-clock spinner, a red-railed alert (or a red tile in a table row) with Try again, and the dashed Empty frame; takes a TanStack Query result as it is.',
    deps: ['lucide-react'],
    ui: ['alert', 'button', 'empty', 'spinner', 'table'],
  },
  'quick-tip': {
    description: 'A muted "?" beside a label that opens its help in a black panel on click, or a tooltip on hover.',
    deps: ['lucide-react'],
    ui: ['popover', 'tooltip'],
  },
  'radio-group': {
    description: 'A set of round options, one chosen at a time, the chosen one marked with a solid dot.',
    deps: ['@base-ui/react'],
  },
  readout: {
    description: 'A big bold tabular figure with a muted label, like an arrival board, marked by a status bar for its tone.',
    deps: [],
  },
  'relative-time': {
    description:
      'A <time> that says when in words ("5 minutes ago", "in 2 days") and keeps itself current, with the full date as its title.',
    deps: [],
  },
  resizable: { description: 'Panels split by dividers you can drag, with an optional square grip.', deps: ['react-resizable-panels'] },
  'route-bullet': {
    description: 'A coloured circle with a route letter or number, or a diamond for express service. Name a route and its colour follows.',
    deps: ['class-variance-authority'],
  },
  'scroll-area': { description: 'A box that scrolls with a thin square scrollbar.', deps: ['@base-ui/react'] },
  'segmented-control': {
    description: 'One of a few options on a black sign band like the tab bar, the chosen segment a solid white panel; never empty.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  select: {
    description: 'A black box that opens a list of options in a black panel, the chosen one ticked.',
    deps: ['@base-ui/react', 'lucide-react'],
  },
  separator: { description: 'A hairline rule, across or down.', deps: ['@base-ui/react'] },
  'settings-section': {
    description:
      'A settings section: the bold title and explanation beside a black panel holding the form, with Save, Cancel and a status in its footer; a red-edged danger-zone variant.',
    deps: ['class-variance-authority'],
  },
  sheet: {
    description: 'A full-height black panel that slides in from an edge, with the sign’s white rule along its top.',
    deps: ['@base-ui/react', 'lucide-react'],
    ui: ['button'],
  },
  sign: {
    description: 'The sign band: white type on black under a thin white rule, with route bullets and an arrow beside the words.',
    deps: ['class-variance-authority'],
  },
  skeleton: { description: 'A flat grey block that pulses where content will load, on the dark ground or the white wall.', deps: [] },
  slider: {
    description: 'A flat track with the chosen range drawn solid and square thumbs; one value or a range.',
    deps: ['@base-ui/react'],
  },
  sonner: {
    description: 'Toasts as black panels with a status rail and a coloured icon tile, like the alert.',
    deps: ['sonner', 'lucide-react'],
  },
  spinner: { description: 'A ring of square ticks that steps round like a station clock.', deps: [] },
  spotlight: {
    description:
      'Points at something on the page: a flat outline in the ring colour round the target and a black-panel callout anchored to it, with a bold name label on sections and a Back / Next / Done tour.',
    deps: ['@base-ui/react', 'class-variance-authority', 'lucide-react'],
    ui: ['button'],
  },
  steps: {
    description:
      'Square step markers joined by heavy rules: done in the panel colour, current in signal yellow, failed in red; optionally clickable.',
    deps: ['lucide-react'],
  },
  'strip-map': {
    description:
      'The line diagram from inside the train, as a stepper or timeline: stops on a line in its route colour, with passed stops gone dark.',
    deps: [],
    ui: ['route-bullet'],
  },
  switch: {
    description: 'A square rocker: a hollow box when off, a solid one with the block slid across when on.',
    deps: ['@base-ui/react'],
  },
  table: { description: 'A plain, dense table with a black header band and tabular numbers.', deps: [] },
  tabs: {
    description: 'Tabs on a black band with the chosen one lit white, or a quieter line under the chosen tab.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  textarea: { description: 'A multi-line text box, black in either mode, that grows with its text.', deps: [] },
  tile: {
    description:
      'A clickable black panel with an icon on a square of solid colour, a bold title and a line of description; selected gets a white edge and rail.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  'time-input': {
    description: 'A time of day typed however it comes into a black box with a clock, settled to “2:30 PM” and stored as HH:mm.',
    deps: ['lucide-react'],
    ui: ['input-group'],
  },
  toggle: {
    description: 'A button that stays pressed in, shown as a solid panel, until pressed again.',
    deps: ['@base-ui/react', 'class-variance-authority'],
  },
  'toggle-group': {
    description: 'A row of toggles, one or several pressed, spaced apart or butted into one strip.',
    deps: ['@base-ui/react', 'class-variance-authority'],
    ui: ['toggle'],
  },
  'tone-badge': {
    description:
      'A square bold badge picked by tone: a solid status fill, a bordered neutral or the secondary band; takes the signal-tone names too.',
    deps: [],
    ui: ['badge'],
  },
  toolbar: {
    description: 'A row of ghost buttons, toggles and links that is one tab stop with arrow-key focus; floating, a black panel.',
    deps: ['@base-ui/react', 'class-variance-authority'],
    ui: ['button', 'toggle', 'tooltip'],
  },
  tooltip: {
    description: 'A short label in a small black panel on hover or focus, for icon buttons and anything whose name isn’t printed.',
    deps: ['@base-ui/react'],
  },
  tree: {
    description:
      'A WAI-ARIA tree with square + / − toggles, hairline guide lines, arrow-key and typeahead navigation, and a white-on-black selected row.',
    deps: ['lucide-react'],
  },
};
const uiItems = Object.entries(UI).map(([name, spec]) => ({
  name,
  type: 'registry:ui',
  title: name.replace(/(^|-)(\w)/g, (_, s, c) => (s ? ' ' : '') + c.toUpperCase()),
  description: spec.description,
  dependencies: spec.deps,
  ...(spec.devDeps && { devDependencies: spec.devDeps }),
  registryDependencies: [THEME, UTILS, ...(spec.ui ?? []).map(url)],
  files: [{ path: `registry/headway/ui/${name}.tsx`, type: 'registry:ui' }],
}));

// ── blocks ─────────────────────────────────────────────────────────────────
// larger compositions, installed to components/blocks/
// name → { title, description, deps (npm), ui (registry items it imports) }
const BLOCKS = {
  'app-shell': {
    title: 'App shell',
    description:
      'The staff app frame: a black sign column under a white rule with a bold wordmark, route bullets and nav grouped by kind of work, the current page marked by a heavy white bar, collapsible to an icon rail, a drawer on phones, and a top bar over the page.',
    deps: ['lucide-react'],
    ui: ['button', 'route-bullet', 'sheet', 'tooltip'],
  },
  'data-table': {
    title: 'Data table',
    description:
      'A table under a black header band that sorts, filters, pages, hides columns and selects rows, with a black bulk-action panel, a pinned header and first column, drag or keyboard reordering, expandable rows, and loading and empty states.',
    deps: ['@tanstack/react-table', '@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities', 'lucide-react'],
    ui: ['table', 'button', 'checkbox', 'dropdown-menu', 'input-group', 'pagination', 'empty', 'spinner'],
  },
  'user-menu': {
    title: 'User menu',
    description:
      'Who you are and where, in a black panel menu: avatar, name and email, the active organisation and role, switching organisations, your links and sign out; from the top bar or the foot of the sign column.',
    deps: ['lucide-react'],
    ui: ['avatar', 'dropdown-menu'],
  },
  'week-calendar': {
    title: 'Week calendar',
    description:
      'One week, Monday to Sunday, on a black panel: events as black blocks with a heavy edge in their status, tone or route colour, today in a white square and the current time as a white line, week navigation, and a day list on narrow screens.',
    deps: ['lucide-react'],
    ui: ['button', 'route-bullet', 'tone-badge'],
  },
};
const blockItems = Object.entries(BLOCKS).map(([name, spec]) => ({
  name,
  type: 'registry:block',
  title: spec.title,
  description: spec.description,
  dependencies: spec.deps,
  registryDependencies: [THEME, UTILS, ...(spec.ui ?? []).map(url)],
  files: [{ path: `registry/headway/blocks/${name}.tsx`, type: 'registry:component', target: `components/blocks/${name}.tsx` }],
}));

// ── categories ─────────────────────────────────────────────────────────────
// every item belongs to exactly one, in this order; the preview groups its
// sidebar and pages by them, and the registry carries them as `categories`
const CATEGORIES = [
  { id: 'foundations', title: 'Foundations', items: ['theme', 'utils', 'use-color-mode', 'use-hotkeys'] },
  { id: 'wayfinding', title: 'Wayfinding', items: ['sign', 'route-bullet', 'strip-map', 'arrow'] },
  {
    id: 'actions',
    title: 'Actions',
    items: ['button', 'button-group', 'toggle', 'toggle-group', 'link', 'segmented-control', 'toolbar', 'copy-button', 'download-link'],
  },
  {
    id: 'forms',
    title: 'Forms',
    items: [
      'field',
      'label',
      'input',
      'input-group',
      'textarea',
      'input-otp',
      'native-select',
      'select',
      'combobox',
      'checkbox',
      'radio-group',
      'switch',
      'slider',
      'calendar',
      'date-picker',
      'number-input',
      'date-range-picker',
      'time-input',
      'file-upload',
    ],
  },
  {
    id: 'navigation',
    title: 'Navigation',
    items: ['tabs', 'breadcrumb', 'pagination', 'navigation-menu', 'menubar', 'command', 'key-hints', 'steps'],
  },
  {
    id: 'overlays',
    title: 'Overlays',
    items: [
      'dialog',
      'alert-dialog',
      'sheet',
      'drawer',
      'popover',
      'hover-card',
      'tooltip',
      'dropdown-menu',
      'context-menu',
      'confirm-dialog',
      'spotlight',
      'lightbox',
      'quick-tip',
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    items: ['alert', 'sonner', 'progress', 'spinner', 'skeleton', 'empty', 'banner', 'query-state', 'busy-hold', 'error-page'],
  },
  {
    id: 'display',
    title: 'Display',
    items: ['badge', 'avatar', 'kbd', 'card', 'item', 'table', 'chart', 'carousel', 'accordion', 'collapsible'],
  },
  {
    id: 'data',
    title: 'Data',
    items: [
      'markdown',
      'tree',
      'tone-badge',
      'deadline',
      'relative-time',
      'readout',
      'meter',
      'distribution',
      'event-log',
      'description-list',
      'highlight',
    ],
  },
  {
    id: 'layout',
    title: 'Layout',
    items: ['separator', 'aspect-ratio', 'scroll-area', 'resizable', 'page-header', 'tile', 'settings-section'],
  },
  { id: 'blocks', title: 'Blocks', items: ['app-shell', 'data-table', 'user-menu', 'week-calendar'] },
];
const categoryOf = new Map(CATEGORIES.flatMap((c) => c.items.map((name) => [name, c.id])));

const registry = {
  $schema: 'https://ui.shadcn.com/schema/registry.json',
  name: 'headway',
  homepage: BASE,
  items: [theme, utils, ...hookItems, ...uiItems, ...blockItems],
};

// every item has a category, and every category names real items
{
  const names = new Set(registry.items.map((i) => i.name));
  const missing = [...names].filter((n) => !categoryOf.has(n));
  const unknown = [...categoryOf.keys()].filter((n) => !names.has(n));
  if (missing.length) throw new Error(`no category for: ${missing.join(', ')} (add them to CATEGORIES)`);
  if (unknown.length) throw new Error(`CATEGORIES names items that don't exist: ${unknown.join(', ')}`);
  if (categoryOf.size !== CATEGORIES.reduce((n, c) => n + c.items.length, 0)) throw new Error('an item is in two categories');
  for (const item of registry.items) item.categories = [categoryOf.get(item.name)];
}

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
    {
      categories: CATEGORIES.map(({ id, title }) => ({ id, title })),
      // in category order, then as listed within the category
      items: registry.items
        .map(({ name, type, title, description }) => ({ name, type, title, description, category: categoryOf.get(name) }))
        .sort(
          (a, b) =>
            CATEGORIES.findIndex((c) => c.id === a.category) - CATEGORIES.findIndex((c) => c.id === b.category) ||
            CATEGORIES.find((c) => c.id === a.category).items.indexOf(a.name) -
              CATEGORIES.find((c) => c.id === b.category).items.indexOf(b.name),
        ),
    },
    null,
    2,
  ) + '\n',
);
execFileSync('npx', ['shadcn', 'build', '--output', 'public/r'], { stdio: 'inherit' });
console.log(`registry: ${registry.items.length} items → public/r (base ${BASE})`);
