import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { DEMOS } from '@/docs/demos';
import items from '@/docs/items.generated.json';
import './styles.css';

// A plain preview: every registry item in order, with its demo. Not a docs
// site; just enough to look at things while building them. ?item=<name>
// shows one item on its own.
const only = new URLSearchParams(location.search).get('item');
const shown = only ? items.filter((item) => item.name === only) : items;

function Preview() {
  return (
    <div className="min-h-screen">
      <header className="sign sign-rule px-6 pb-5">
        <h1 className="text-3xl">Headway</h1>
        <p className="mt-1 text-sm font-normal text-muted-foreground">Preview of every item in the registry</p>
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
              <section key={item.name} id={item.name} className="flex scroll-mt-6 flex-col gap-4">
                <div className="border-t-2 border-foreground pt-3">
                  <h2 className="text-2xl font-bold tracking-tight">{item.title}</h2>
                  <p className="mt-1 max-w-prose text-sm text-muted-foreground">{item.description}</p>
                </div>
                {Demo && <Demo />}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Preview />
  </StrictMode>,
);
