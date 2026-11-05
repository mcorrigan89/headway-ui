# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Headway is a design system for React + Tailwind v4 after the NYC subway's signage (the 1970 Unimark/NYCTA standards manual), distributed as a **shadcn registry** (consumers run `npx shadcn add @headway/<name>` and own the copied source). It is modelled on the sibling repo `../phosphor`, which has the same structure at a larger scale. `PLAN.md` holds the design principles, scope and decisions.

## Commands

```bash
pnpm install
pnpm dev          # builds the registry, then runs the preview on :5173 (?item=<name> for one item)
pnpm registry     # regenerate registry.json, public/r/*.json and src/*.generated.*
pnpm check-types  # tsc --noEmit over src/, registry/ and tests/
pnpm lint         # oxlint (.oxlintrc.json)
pnpm format       # oxfmt in place; `pnpm format:check` to only check
pnpm test         # vitest run; `pnpm test tests/tabs.test.tsx -t 'switches'` for one test
pnpm build        # registry + type-check + vite build → dist/
pnpm verify       # install every item into a fresh app in .verify/ and build it
```

`check-types`, `lint`, `format:check`, `test` and `verify` are the checks. `tests/a11y.test.tsx` runs axe's WCAG 2.2 A/AA rules over every demo (contrast is left to `tests/contrast.test.ts`, since jsdom has no layout); a new demo is covered automatically. For a full audit, contrast and open popups included, load `/node_modules/axe-core/axe.min.js` into the running preview and run `axe.run()` in dark and light. Run `verify` after changing any item's dependencies, imports or the theme. Commits are made with the Graphite CLI (`gt create`), one branch per piece of work, stacked on `main`.

## Architecture

- **`scripts/build-registry.mjs` is the source of truth**: the item list (`UI` map: description, npm `deps`, registry `ui` deps), and the theme item (fonts, `sign` / `sign-rule` utilities). Colours live in `scripts/palette.mjs` (`LINES`, `PALETTE`, `TEXT_PAIRS`, `contrast()`); `tests/contrast.test.ts` holds every pair in `TEXT_PAIRS` to WCAG AA. The script writes `registry.json`, `src/theme.generated.css` (via `scripts/theme-css.mjs`) and `src/items.generated.json`, then runs `shadcn build` into `public/r/`. All four outputs are gitignored.
- **Colour modes**: dark is the default (`PALETTE`, written to `:root` by shadcn). `LIGHT` applies under `:root[data-mode="light"]` (and `data-mode="system"` when the OS prefers light): a white wall with black panels. The `on-sign` utility re-applies the dark text/control/ring colours (`PANEL`) inside a black panel, so components inside cards, alerts, tables, the tab bar and signs look the same in both modes; it leaves `card`/`popover` alone so each mode keeps its own panel colour. `tests/contrast.test.ts` checks the dark, light and on-sign pairs. Anything loose on the page must read on both the charcoal ground and the white wall.
- Palette values must be **literals**, not `var(...)`: the shadcn CLI turns a `var()` colour token into a self-referencing variable.
- Line colours are identity and status, never body text. Text on a status fill uses its `*-foreground`; red text uses `error`.
- **Blocks** (`BLOCKS` in the build script, files in `registry/headway/blocks/`) are larger compositions installed to `components/blocks/` and imported as `@/components/blocks/*`. Many items were ported from the sibling `../govwell-ui` and keep its APIs; when fixing a bug in a shared component, check whether the other library has it too.
- **Registry sources** in `registry/headway/{ui,blocks,lib,hooks}` import each other only via consumer-style aliases (`@/components/ui/*`, `@/lib/*`, `@/hooks/*`), mapped back into `registry/` by `tsconfig.json` and `vite.config.ts`.
- Components follow shadcn conventions on **Base UI** (`@base-ui/react`, not Radix): `data-slot` attributes, `cva` variants, `cn()`, composition via the `render` prop. Square corners (`rounded-none`) except bullets and dots; focus is `outline-3 outline-offset-2 outline-ring` (yellow).
- **Preview** (`src/main.tsx`): every item from `items.generated.json` with its demo from `DEMOS` in `src/demos.tsx`, grouped by the `CATEGORIES` in `scripts/build-registry.mjs` (`#/` all, `#/c/<category>` one group, `#/<name>` one item). Tests live in `tests/` (jsdom + Testing Library).

## Styling conventions

- **Square**: `rounded-none` everywhere (the radius token is 0, so `rounded-md` etc. are square too). Only route bullets, strip-map dots, radio dots, avatars and similar true circles use `rounded-full`.
- **Type**: Helvetica-style sans only. Titles and labels are `font-bold` with `tracking-tight` on large sizes; body is regular. No uppercase/letter-spaced "display" styling, no monospace except code (`font-mono` in `kbd`).
- **Focus**: `outline-none focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring`. `outline-solid` is required: in Tailwind v4 `outline-none` sets the outline style to none. Inside menus and lists, highlighted items use `bg-accent text-accent-foreground` instead of a ring.
- **Panels**: anything that floats or holds text in a box (popover, dialog, sheet, drawer, menus, tooltip, hover card, select popup, command list, toasts) is a black panel: `on-sign border border-border bg-popover text-popover-foreground`. Dialog-sized panels carry the sign's white rule (`before:absolute before:inset-x-0 before:top-1.5 before:h-0.5 before:bg-sign-rule` with extra top padding). Overlays behind modals are `bg-black/60`.
- **Controls with a text box** (input, textarea, select trigger, input group, input OTP slots) are black boxes in both modes: `border-2 border-input bg-sign text-sign-foreground [color-scheme:dark]`, `hover:border-muted-foreground`, white border on focus (`focus-visible:border-sign-foreground` or `border-foreground` under `on-sign`), `aria-invalid:border-error`.
- **Checked / on / selected** states are white-on-black panels: `bg-primary text-primary-foreground` (white in dark mode and in panels, black on the light wall).
- **Colour** comes from tokens only: `foreground`, `muted-foreground`, `border`, `input`, `accent`, `primary`, `secondary`, `sign`, `ok` / `warning` / `destructive` / `info` (+ `-foreground`) for status fills, `error` for red text, `line-*` for route identity. Never route colours as text. Destructive menu items use `text-error`.
- **Accessible names**: an `aria-label` must contain the visible text (WCAG 2.5.3): a date picker labelled "Travel date" is named "Travel date: Pick a date". Icon-only buttons need an `aria-label`. Don't put `role="separator"` inside a list or listbox: draw the rule with an `aria-hidden` div.
- **No glow, no soft tints**: no coloured shadows, gradients or translucent colour washes. Disabled is `opacity-40`.
- **Motion**: the `tw-animate-css` enter/exit classes shadcn uses are fine; keep durations short (100–200ms).
- Components must read correctly on both the charcoal ground (dark) and the white wall (light); check both with the preview's mode switch.

## Adding a component

1. Put the source in `registry/headway/ui/`.
2. Add it to `UI` in `scripts/build-registry.mjs` (npm deps and any `ui` registry deps).
3. Add its name to one of the `CATEGORIES` in the same file (the build fails if an item has no category). The preview groups its sidebar and pages by category; `#/c/<category>` shows one group.
4. Add a demo to `DEMOS` in `src/demos.tsx` and a test in `tests/`.
5. Run `pnpm verify`.
