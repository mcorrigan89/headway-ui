import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { Button } from '@/components/ui/button';
import { applyColorMode, useColorMode, type ColorMode } from '@/hooks/use-color-mode';
import { DEMOS } from '@/docs/demos';
import items from '@/docs/items.generated.json';
import './styles.css';

// A plain preview: every registry item in order, with its demo. Not a docs
// site; just enough to look at things while building them. ?item=<name>
// shows one item on its own (or a comma-separated few).
const only = new URLSearchParams(location.search).get('item');
const shown = only ? items.filter((item) => only.split(',').includes(item.name)) : items;

const MODES: { mode: ColorMode; label: string }[] = [
  { mode: 'dark', label: 'Dark' },
  { mode: 'light', label: 'Light' },
  { mode: 'system', label: 'System' },
];

function Preview() {
  const [mode, setMode] = useColorMode();
  return (
    <div className="min-h-screen">
      <header className="sign sign-rule on-sign flex flex-wrap items-end justify-between gap-4 px-6 pb-5">
        <div>
          <h1 className="text-3xl">Headway</h1>
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
        <nav className="sticky top-6 hidden h-fit w-40 shrink-0 flex-col gap-1 text-sm md:flex">
          {items.map((item) => (
            <a key={item.name} href={`#${item.name}`} className="text-muted-foreground hover:text-foreground">
              {item.title}
            </a>
          ))}
        </nav>
        <main className="flex min-w-0 flex-1 flex-col gap-16">
          {shown.map((item) => {
            const Demo = DEMOS[item.name];
            return (
              <section key={item.name} id={item.name} className="flex scroll-mt-6 flex-col gap-5">
                <div className="sign sign-rule on-sign px-4 pb-3">
                  <h2 className="text-2xl">{item.title}</h2>
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
