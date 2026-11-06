# Headway

A design system after the New York City subway's signage — black sign bands
with white Helvetica, the route colours, bullets, arrows and strip maps —
distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry). You
install the source into your project and own it, the same way shadcn/ui works.

Not affiliated with or endorsed by the MTA. The route colours and the general
style are borrowed; no MTA marks are used.

## Items

- `theme`: the palette (the ten route colours, status colours drawn from them,
  surfaces), type, and the `sign` and `sign-rule` utilities. Dark only for now.
- `utils`: `cn()`.
- `route-bullet`: a coloured circle with a route letter or number, or an
  express diamond. `route="A"` picks the colour; `color="blue"` takes anything.
- `arrow`: the signage arrow in eight directions.
- `sign`: the black band with the white rule, with room for bullets and an arrow.
- `button`, `badge`, `card`, `alert`, `tabs`, `input`, `label`, `field`, `table`.
- `strip-map`: the line diagram from inside the train, as a stepper or timeline.

## Using it

In a React + Tailwind v4 project that has run `npx shadcn@latest init`, add the
registry to `components.json`:

```json
"registries": {
  "@headway": "https://<where-public-r-is-served>/r/{name}.json"
}
```

Then install the theme and whatever you need:

```bash
npx shadcn@latest add @headway/theme
npx shadcn@latest add @headway/button @headway/sign @headway/route-bullet
```

Items pull in the items they build on.

Type is Helvetica where the system has it, and Inter (installed with the theme)
everywhere else.

## Working on it

```bash
pnpm install
pnpm dev        # registry + preview at :5173 (?item=<name> shows one item)
pnpm registry   # registry.json → public/r/*.json (REGISTRY_URL sets the base)
pnpm build      # registry + type-check + preview → dist/
pnpm test       # vitest
pnpm verify     # install every item into a fresh app and build it
```

- Sources are in `registry/headway/{ui,lib,hooks}`.
- The item list and the whole theme are in `scripts/build-registry.mjs`; the
  colours are in `scripts/palette.mjs`, where `tests/contrast.test.ts` checks
  every text/surface pair against WCAG AA.
- To add a component:
  1. Put it in `registry/headway/ui/`.
  2. Add it to the `UI` map in `scripts/build-registry.mjs`.
  3. Add a demo to `DEMOS` in `src/demos.tsx` and a test in `tests/`.
  4. Run `pnpm verify`.

See [PLAN.md](PLAN.md) for the design principles and what comes next.
