import type { ReactNode } from 'react';

// One demo per registry item, keyed by item name. Items without one show
// their description only.

const LINES = ['blue', 'orange', 'lime', 'brown', 'grey', 'yellow', 'red', 'green', 'purple', 'shuttle'];
const STATUS = ['ok', 'warning', 'destructive', 'info'];
const SURFACES = ['background', 'card', 'muted', 'secondary', 'accent', 'sign', 'primary'];

function Swatch({ token, label = token }: { token: string; label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-12 w-24 border border-border" style={{ background: `var(--${token})` }} />
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

function ThemeDemo() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold">Route colours</h3>
        <div className="flex flex-wrap gap-4">
          {LINES.map((l) => (
            <Swatch key={l} token={`line-${l}`} />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold">Status</h3>
        <div className="flex flex-wrap gap-4">
          {STATUS.map((s) => (
            <Swatch key={s} token={s} />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold">Surfaces</h3>
        <div className="flex flex-wrap gap-4">
          {SURFACES.map((s) => (
            <Swatch key={s} token={s} />
          ))}
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold">Type</h3>
        <div className="flex flex-col gap-1">
          <p className="text-5xl font-bold tracking-tight">Times Sq–42 St</p>
          <p className="text-3xl font-bold tracking-tight">Downtown &amp; Brooklyn</p>
          <p className="text-xl font-medium">Uptown and the Bronx</p>
          <p className="text-base">Trains run every 4 to 6 minutes until 9 pm.</p>
          <p className="text-sm text-muted-foreground">Exit at the front of the train for 7 Av.</p>
        </div>
      </section>
      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-bold">Sign utilities</h3>
        <div className="sign sign-rule max-w-md px-4 pb-4 text-2xl">Downtown &amp; Brooklyn</div>
      </section>
    </div>
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  theme: ThemeDemo,
};
