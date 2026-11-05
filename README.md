# Headway

A design system after the New York City subway's signage — black sign bands
with white Helvetica, the route colours, bullets, arrows and strip maps —
distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry). You
install the source into your project and own it, the same way shadcn/ui works.

Not affiliated with or endorsed by the MTA. The route colours and the general
style are borrowed; no MTA marks are used.

## Items

- `theme`: the palette (the ten route colours, status colours drawn from them,
  surfaces), type, and the `sign`, `sign-rule` and `on-sign` utilities.
- `utils`: `cn()`.
- `use-color-mode`: dark (the default), light, or follow the OS.
- `route-bullet`: a coloured circle with a route letter or number, or an
  express diamond. `route="A"` picks the colour; `color="blue"` takes anything.
- `arrow`: the signage arrow in eight directions.
- `sign`: the black band with the white rule, with room for bullets and an arrow.
- `strip-map`: the line diagram from inside the train, as a stepper or timeline.
- The standard shadcn set, restyled: accordion, alert, alert-dialog,
  aspect-ratio, avatar, badge, breadcrumb, button, button-group, calendar,
  card, carousel, chart, checkbox, collapsible, combobox, command,
  context-menu, date-picker, dialog, drawer, dropdown-menu, empty, field,
  hover-card, input, input-group, input-otp, item, kbd, label, menubar,
  native-select, navigation-menu, pagination, popover, progress, radio-group,
  resizable, scroll-area, select, separator, sheet, skeleton, slider, sonner
  (toasts), spinner, switch, table, tabs, textarea, toggle, toggle-group and
  tooltip.

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

**Light mode.** Headway is dark by default. Set `data-mode="light"` on `<html>`
for a white wall with the signs still black, or `data-mode="system"` to follow
the OS; the `use-color-mode` hook does this and remembers the choice. In light
mode, cards, alerts, tables, inputs and the tab bar are black panels. Put
`on-sign` on your own black panels so text and controls inside them take the
light-on-black colours in either mode.

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
