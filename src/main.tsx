import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';
import { applyColorMode, useColorMode, type ColorMode } from '@/hooks/use-color-mode';
import { DEMOS } from '@/docs/demos';
import items from '@/docs/items.generated.json';
import { cn } from '@/lib/utils';
import './styles.css';

// A plain preview: every registry item with its demo. Not a docs site; just
// enough to look at things while building them. The sidebar opens one item
// at #/<name> (#/ or no hash shows them all). ?item=<name>,<name> shows a
// fixed few, which is handy for screenshots.
const only = new URLSearchParams(location.search).get('item');
const pinned = only ? items.filter((item) => only.split(',').includes(item.name)) : items;

const MODES: { mode: ColorMode; label: string }[] = [
  { mode: 'dark', label: 'Dark' },
  { mode: 'light', label: 'Light' },
  { mode: 'system', label: 'System' },
];

/** the item named by the #/<name> hash, or null for all of them */
function routeFromHash(): string | null {
  const name = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  return items.some((item) => item.name === name) ? name : null;
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

function Preview() {
  const [mode, setMode] = useColorMode();
  const route = useRoute();
  const shown = route ? items.filter((item) => item.name === route) : pinned;
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
      </header>
      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-10">
        {/* scrolls on its own: the list is taller than most windows */}
        <nav
          aria-label="Components"
          className="sticky top-6 hidden max-h-[calc(100vh-3rem)] w-44 shrink-0 flex-col gap-0.5 self-start overflow-y-auto text-sm md:flex"
        >
          <a href="#/" aria-current={route ? undefined : 'page'} className={cn(navLink(!route), 'mb-2')}>
            All components
          </a>
          {items.map((item) => (
            <a
              key={item.name}
              href={`#/${item.name}`}
              aria-current={route === item.name ? 'page' : undefined}
              className={navLink(route === item.name)}
            >
              {item.title}
            </a>
          ))}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col gap-16">
          {shown.map((item) => {
            const Demo = DEMOS[item.name];
            return (
              <section key={item.name} id={item.name} className="flex flex-col gap-5">
                <div className="sign sign-rule on-sign px-4 pb-3">
                  <h2 className="text-2xl">
                    <a href={`#/${item.name}`}>{item.title}</a>
                  </h2>
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
          })}
        </main>
      </div>
    </div>
  );
}

// before React renders, so a light reload doesn't flash dark
applyColorMode();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
