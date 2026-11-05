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

`check-types`, `lint`, `format:check`, `test` and `verify` are the checks. Run `verify` after changing any item's dependencies, imports or the theme. Commits are made with the Graphite CLI (`gt create`), one branch per piece of work, stacked on `main`.

## Architecture

- **`scripts/build-registry.mjs` is the source of truth**: the item list (`UI` map: description, npm `deps`, registry `ui` deps), and the theme item (fonts, `sign` / `sign-rule` utilities). Colours live in `scripts/palette.mjs` (`LINES`, `PALETTE`, `TEXT_PAIRS`, `contrast()`); `tests/contrast.test.ts` holds every pair in `TEXT_PAIRS` to WCAG AA. The script writes `registry.json`, `src/theme.generated.css` (via `scripts/theme-css.mjs`) and `src/items.generated.json`, then runs `shadcn build` into `public/r/`. All four outputs are gitignored.
- Palette values must be **literals**, not `var(...)`: the shadcn CLI turns a `var()` colour token into a self-referencing variable.
- Line colours are identity and status, never body text. Text on a status fill uses its `*-foreground`; red text uses `error`.
- **Registry sources** in `registry/headway/{ui,lib,hooks}` import each other only via consumer-style aliases (`@/components/ui/*`, `@/lib/*`, `@/hooks/*`), mapped back into `registry/` by `tsconfig.json` and `vite.config.ts`.
- Components follow shadcn conventions on **Base UI** (`@base-ui/react`, not Radix): `data-slot` attributes, `cva` variants, `cn()`, composition via the `render` prop. Square corners (`rounded-none`) except bullets and dots; focus is `outline-3 outline-offset-2 outline-ring` (yellow).
- **Preview** (`src/main.tsx`): one page rendering every item from `items.generated.json` with its demo from `DEMOS` in `src/demos.tsx`. Tests live in `tests/` (jsdom + Testing Library).

## Adding a component

1. Put the source in `registry/headway/ui/`.
2. Add it to `UI` in `scripts/build-registry.mjs` (npm deps and any `ui` registry deps).
3. Add a demo to `DEMOS` in `src/demos.tsx` and a test in `tests/`.
4. Run `pnpm verify`.
