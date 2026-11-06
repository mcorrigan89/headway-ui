import { Fragment, StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';
import { applyColorMode, useColorMode, type ColorMode } from '@/hooks/use-color-mode';
import { DEMOS } from '@/docs/demos';
import catalog from '@/docs/items.generated.json';
import { cn } from '@/lib/utils';
import { ExampleApp } from './example-app/app';
import './styles.css';

// A plain preview: every registry item with its demo, grouped by category.
// Not a docs site; just enough to look at things while building them.
//   #/                 everything
//   #/c/<category>     one category
//   #/<name>           one item
// ?item=<name>,<name> shows a fixed few, which is handy for screenshots.
// ?example=app is the sample operations console (src/example-app), full screen.
const { categories, items } = catalog;
type Item = (typeof items)[number];

const only = new URLSearchParams(location.search).get('item');
const pinned = only ? items.filter((item) => only.split(',').includes(item.name)) : items;

const MODES: { mode: ColorMode; label: string }[] = [
  { mode: 'dark', label: 'Dark' },
  { mode: 'light', label: 'Light' },
  { mode: 'system', label: 'System' },
];

type Route = { kind: 'all' } | { kind: 'category'; id: string } | { kind: 'item'; name: string };

function routeFromHash(): Route {
  const path = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const category = path.match(/^c\/(.+)$/)?.[1];
  if (category && categories.some((c) => c.id === category)) return { kind: 'category', id: category };
  if (items.some((item) => item.name === path)) return { kind: 'item', name: path };
  return { kind: 'all' };
}

function useRoute() {
  const [route, setRoute] = useState(routeFromHash);
  useEffect(() => {
    const onHashChange = () => {
      setRoute(routeFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return route;
}

function ItemSection({ item }: { item: Item }) {
  const Demo = DEMOS[item.name];
  return (
    <section id={item.name} className="flex flex-col gap-5">
      <div className="sign sign-rule on-sign px-4 pb-3">
        <h3 className="text-2xl">
          <a href={`#/${item.name}`}>{item.title}</a>
        </h3>
        <p className="mt-1 max-w-prose text-sm font-normal tracking-normal text-muted-foreground">{item.description}</p>
      </div>
      {Demo && (
        // a block, so a lone trigger button keeps its own width
        <div>
          <Demo />
        </div>
      )}
    </section>
  );
}

function Preview() {
  const [mode, setMode] = useColorMode();
  const route = useRoute();

  // what the main column shows, already grouped by category
  const shown =
    route.kind === 'item'
      ? items.filter((item) => item.name === route.name)
      : route.kind === 'category'
        ? items.filter((item) => item.category === route.id)
        : pinned;
  const groups = categories
    .map((category) => ({ ...category, items: shown.filter((item) => item.category === category.id) }))
    .filter((group) => group.items.length > 0);
  // a single item doesn't need its category spelled out above it
  const showCategoryHeads = route.kind !== 'item';
  const activeCategory =
    route.kind === 'category' ? route.id : route.kind === 'item' ? items.find((i) => i.name === route.name)?.category : undefined;

  const navLink = (active: boolean) =>
    cn(
      'block px-2 py-1 hover:text-foreground',
      active ? 'bg-primary font-bold text-primary-foreground hover:text-primary-foreground' : 'text-muted-foreground',
    );

  return (
    <div className="min-h-screen">
      <header className="sign sign-rule on-sign flex flex-wrap items-end justify-between gap-4 px-6 pb-5">
        <div>
          <h1 className="text-3xl">
            <a href="#/">Headway</a>
          </h1>
          <p className="mt-1 text-sm font-normal text-muted-foreground">Preview of every item in the registry</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href="?example=app#/" className="text-sm font-bold underline decoration-2 underline-offset-4 hover:decoration-4">
            Sample app
          </a>
          <div role="group" aria-label="Colour mode" className="flex gap-1">
            {MODES.map((m) => (
              <Button
                key={m.mode}
                size="sm"
                variant={mode === m.mode ? 'default' : 'ghost'}
                aria-pressed={mode === m.mode}
                onClick={() => setMode(m.mode)}
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-10">
        {/* scrolls on its own: the list is taller than most windows */}
        <nav
          aria-label="Components"
          className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-48 shrink-0 flex-col gap-5 self-start overflow-y-auto pb-6 text-sm md:flex"
        >
          <a href="#/" aria-current={route.kind === 'all' ? 'page' : undefined} className={navLink(route.kind === 'all')}>
            All components
          </a>
          {categories.map((category) => {
            const members = items.filter((item) => item.category === category.id);
            const isCurrent = route.kind === 'category' && route.id === category.id;
            return (
              <div key={category.id} className="flex flex-col gap-0.5">
                <a
                  href={`#/c/${category.id}`}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={cn(
                    'mb-1 flex items-baseline justify-between border-b-2 px-2 pb-1 font-bold',
                    isCurrent ? 'border-foreground text-foreground' : 'border-border hover:border-foreground',
                    activeCategory === category.id || isCurrent ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {category.title}
                  <span className="text-xs font-normal tabular-nums">{members.length}</span>
                </a>
                {members.map((item) => (
                  <a
                    key={item.name}
                    href={`#/${item.name}`}
                    aria-current={route.kind === 'item' && route.name === item.name ? 'page' : undefined}
                    className={navLink(route.kind === 'item' && route.name === item.name)}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            );
          })}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col gap-20">
          {groups.map((group) => (
            <Fragment key={group.id}>
              <div className="flex flex-col gap-16">
                {showCategoryHeads && (
                  // the category as a station sign: a big black panel with the white rule
                  <header className="sign sign-rule on-sign flex items-end justify-between gap-4 px-5 pb-4">
                    <h2 className="text-5xl leading-none tracking-tight">
                      <a href={`#/c/${group.id}`}>{group.title}</a>
                    </h2>
                    <span className="text-sm font-normal text-muted-foreground tabular-nums">
                      {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                    </span>
                  </header>
                )}
                {group.items.map((item) => (
                  <ItemSection key={item.name} item={item} />
                ))}
              </div>
            </Fragment>
          ))}
        </main>
      </div>
    </div>
  );
}

// before React renders, so a light reload doesn't flash dark
applyColorMode();

const example = new URLSearchParams(location.search).get('example') === 'app';

createRoot(document.getElementById('root')!).render(<StrictMode>{example ? <ExampleApp /> : <Preview />}</StrictMode>);
