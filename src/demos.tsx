import type { ReactNode } from 'react';

import { Arrow, type Direction } from '@/components/ui/arrow';
import { Button } from '@/components/ui/button';
import { RouteBullet } from '@/components/ui/route-bullet';

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

const ROUTES = ['A', 'C', 'E', 'B', 'D', 'F', 'M', 'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', '1', '2', '3', '4', '5', '6', '7', 'S'];
const DIRECTIONS: Direction[] = ['up', 'up-right', 'right', 'down-right', 'down', 'down-left', 'left', 'up-left'];

function RouteBulletDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {ROUTES.map((r) => (
          <RouteBullet key={r} route={r} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <RouteBullet route="Q" size="sm" />
        <RouteBullet route="Q" />
        <RouteBullet route="Q" size="lg" />
        <RouteBullet route="Q" size="xl" />
      </div>
      <div className="flex items-center gap-4">
        <RouteBullet route="6" size="lg" express />
        <RouteBullet route="7" size="lg" express />
        <RouteBullet color="lime" size="lg">
          1
        </RouteBullet>
      </div>
    </div>
  );
}

function ArrowDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        {DIRECTIONS.map((d) => (
          <Arrow key={d} direction={d} className="size-10" />
        ))}
      </div>
      <div className="sign flex w-fit items-center gap-3 px-4 py-3 text-xl">
        <Arrow direction="up-left" className="size-8" />
        Exit
      </div>
    </div>
  );
}

function ButtonDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button>Plan a trip</Button>
        <Button variant="secondary">Service status</Button>
        <Button variant="outline">Maps</Button>
        <Button variant="ghost">Accessibility</Button>
        <Button variant="destructive">Cancel alert</Button>
        <Button variant="link">Fares</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="xs">Extra small</Button>
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">
          Next train
          <Arrow data-icon="inline-end" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Next">
          <Arrow />
        </Button>
        <Button disabled>Disabled</Button>
      </div>
    </div>
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  theme: ThemeDemo,
  arrow: ArrowDemo,
  button: ButtonDemo,
  'route-bullet': RouteBulletDemo,
};
