# Plan: NYC subway design system

A React + Tailwind v4 design system based on the visual language of the New
York City subway: the 1970 Unimark / NYCTA Graphics Standards Manual, the
Vignelli diagram, and the signage in the stations today. It ships the same way
as [Phosphor](../phosphor): as a **shadcn registry**. People install the source
into their own project with `npx shadcn add @<name>/<item>`, and the copied code
is theirs to change.

Working name: **TBD** (see open questions). `<name>` below stands for it.

## Scope

**In scope for this first pass**

- Repo scaffold, tooling and the registry build, copied from Phosphor
- The theme: colour tokens, type, spacing, the sign-band surface
- About 12 core UI components
- A small dev preview page that renders each component, so we can see them
- Tests and the `verify` install check

**Not in scope yet**

- Instruments (the arrival board / countdown clock and similar)
- Blocks (app shell, sign-in, data table, and so on)
- The gallery and docs site
- Example apps
- Deploying to GitHub Pages

## Design principles (from the manual)

1. **The sign is the unit.** Panels are black bands with white type and a thin
   white rule along the top edge. Square corners. Information is put together
   in fixed modules, not freeform.
2. **One typeface.** A Helvetica-style grotesque in two or three weights.
   Sentence case, tight but readable spacing, no decorative type.
3. **Colour is a code, not decoration.** The route colours mean something.
   Use them for status and identity, and keep everything else black, white and
   grey.
4. **Circles carry identity.** The route bullet (a coloured circle with a
   letter or number) is the one round shape in a square system.
5. **Arrows point the way.** Direction and next steps use the manual's bold
   arrows.
6. **Read it at a glance.** High contrast, generous size, little on screen.

## Foundations

### Colour

The route palette (from the MTA's published line colours):

| Token | Hex | Lines | Bullet text |
|---|---|---|---|
| `line-blue` | `#0039A6` | A C E | white |
| `line-orange` | `#FF6319` | B D F M | white |
| `line-lime` | `#6CBE45` | G | white |
| `line-brown` | `#996633` | J Z | white |
| `line-grey` | `#A7A9AC` | L | white |
| `line-yellow` | `#FCCC0A` | N Q R W | **black** |
| `line-red` | `#EE352E` | 1 2 3 | white |
| `line-green` | `#00933C` | 4 5 6 | white |
| `line-purple` | `#B933AD` | 7 | white |
| `line-shuttle` | `#808183` | S | white |

Semantic tokens map onto them, so components never hard-code a line:

| Semantic | Source | Use |
|---|---|---|
| `ok` | green | Good service, success |
| `warning` | yellow (black text) | Delays, caution |
| `destructive` | red | Suspended, errors |
| `info` | blue | Planned work, notices |
| `primary` | white on sign-black | Main actions |

Surfaces: `sign` (near-black, tuned against photos of real signs), `ground`
(page background), `rule` (the white line on top of a sign), plus a grey scale
for borders and muted text.

The standard shadcn tokens (`background`, `foreground`, `card`, `primary`,
`border`, `ring`, …) are all defined, so stock shadcn components still look
right.

Follow Phosphor's rule: palette values must be literals, not `var(...)`, or
the shadcn CLI writes self-referencing variables.

Contrast: white text fails on yellow, lime and grey at small sizes. Bullets
follow the MTA (black text on yellow). For body text, no light line colour is
used as a text colour. A test checks every text/background pair against WCAG
AA.

### Type

- **Primary face:** TeX Gyre Heros (a free Helvetica clone, GUST font
  licence). Check whether an npm package exists. If not, self-host the woff2
  files in the theme item.
- **Fallback stack:** `'TeX Gyre Heros', 'Helvetica Neue', Helvetica, Arial, sans-serif`
- **Mono** (times, codes, tabular numbers): a plain monospace, used rarely. The
  primary face with `tabular-nums` covers most cases.
- Scale: a short, modular scale tied to the sign grid (for example 12 / 14 / 16
  / 20 / 28 / 40 / 56). Weights: regular, medium, bold.

### Shape and space

- Radius `0` everywhere except bullets and status dots (`rounded-full`).
- A 4px base unit. Sign bands have fixed heights in a few sizes (sm / md / lg).
- The top rule is a utility (`sign-rule`), so any panel can have one.
- Borders are thin and grey. Black bands, not borders, do the heavy lifting.

### Colour modes

**Dark first.** White on black is what the signs look like. Tokens are
structured the same way as Phosphor's (a base palette plus a light palette
under `:root[data-mode="light"]`), so light mode can be added later without
changing any component. Light would be black type on white with the same
black sign bands.

### Theme utilities (CSS in the theme item)

- `sign`: black band, white text, optional top rule
- `sign-rule`: the thin white rule along the top edge
- `bullet`: circle sizing and centring for route bullets
- `grid-sign`: the module grid for laying out sign content

## Components (first pass)

All built shadcn-style on **Base UI** (`@base-ui/react`), as in Phosphor:
`data-slot` attributes, `cva` variants, `cn()` from `@/lib/utils`, and
composition through the `render` prop.

| # | Item | Notes |
|---|---|---|
| 1 | `theme` | Tokens, fonts, utilities above |
| 2 | `utils` | `cn()` |
| 3 | `button` | Variants: primary (white on black), secondary (outline), line colour, ghost, destructive. Optional trailing arrow. |
| 4 | `route-bullet` | Circle with a letter or number. Prop `line` (`A`, `7`, …) picks the colour automatically, or pass `color`. Sizes sm / md / lg. A diamond variant for express service. |
| 5 | `sign` | The black band: title, optional bullets, optional arrow, top rule. The signature piece. |
| 6 | `card` | A panel with an optional sign header |
| 7 | `badge` | Small status pill using the semantic colours |
| 8 | `alert` | Service-status style: Good service / Delays / Planned work / Suspended. Icon, title, body. |
| 9 | `tabs` | Square tabs. The active one is a black band. |
| 10 | `input`, `label`, `field` | Form controls with clear focus rings, labels and error states that work with any form library |
| 11 | `table` | Plain, dense, with a black header row and tabular numbers |
| 12 | `strip-map` | The line diagram from inside the train: a coloured line with stops. Used as a stepper / progress / timeline, with past, current and upcoming states. |
| 13 | `arrow` | The manual's directional arrows in 8 directions, as an SVG component |

Later candidates: select, checkbox, radio, switch, dialog, dropdown menu,
tooltip, toast, breadcrumb, pagination, navigation menu.

## Repo structure (mirrors Phosphor)

```
registry/<name>/
  ui/            components
  lib/utils.ts
  hooks/         (empty for now)
scripts/
  build-registry.mjs   item list, deps, and the whole theme (source of truth)
  theme-css.mjs        renders the theme item to CSS for the preview
  verify-install.mjs   installs every item into a fresh app and builds it
src/
  main.tsx       minimal preview page
  demos.tsx      one demo per item
  styles.css     imports the generated theme
tests/           vitest + Testing Library (jsdom)
```

- `public/r/*.json`, `registry.json` and `src/*.generated.*` are build outputs
  and gitignored.
- Registry sources import each other only through consumer-style aliases
  (`@/components/ui/*`, `@/lib/*`). `tsconfig.json` and `vite.config.ts` map
  them back into `registry/`, so the preview shows exactly what gets installed.

Tooling, same as Phosphor: pnpm, Vite, React 19, Tailwind v4,
TypeScript, oxlint, oxfmt, vitest, shadcn CLI.

Scripts: `dev`, `registry`, `build`, `check-types`, `lint`, `format`,
`format:check`, `test`, `verify`.

## Steps

1. **Scaffold.** Set up `package.json`, configs, aliases and the empty registry
   folders, based on Phosphor. Remove everything instrument-, block-, map- and
   gallery-related. `git init`.
2. **Registry build.** Cut `build-registry.mjs` down to the theme plus a `UI`
   map, and get `pnpm registry` writing `public/r/` with an empty component
   list.
3. **Theme.** Palette, semantic tokens, fonts, radius, the `sign` /
   `sign-rule` / `bullet` utilities. Add a token test and the contrast test.
4. **Preview page.** One page listing every item with its demo. Just enough
   to look at things, not a docs site.
5. **Components** in the order of the table, each with a demo and a test.
   `route-bullet` and `sign` come early because the rest build on them.
6. **Verify.** Run `pnpm verify`, fix install issues, write the README and
   CLAUDE.md.

**Done when:** every item installs into a fresh app through `shadcn add`, and
`check-types`, `lint`, `format:check`, `test` and `verify` all pass.

## Ground rules

- **No MTA branding.** No MTA logo, wordmark, or anything suggesting an
  official or affiliated product. Line colours and the general style are fine.
- **Interpret, don't copy.** The Standards Manual and the Dribbble and print
  references are mood boards. Don't reproduce artwork or pages from them.
- **Fonts must be redistributable.** No Helvetica or Akzidenz-Grotesk files
  in the package.

## Open questions

1. **Name.** It sets the registry namespace (`@<name>/button`) and the folder
   names.
2. **Light mode now or later?** The plan says later, with tokens ready for it.
3. **Route bullets:** should `line="A"` map to real NYC routes, or should we
   only offer colour names (`blue`, `orange`, …) so the library isn't tied to
   NYC route letters?
4. **Hosting:** GitHub Pages like Phosphor when we get there, or somewhere
   else?
