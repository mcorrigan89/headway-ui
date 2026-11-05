import type { ReactNode } from 'react';

import { Arrow, type Direction } from '@/components/ui/arrow';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RouteBullet } from '@/components/ui/route-bullet';
import { Sign, SignContent, SignDescription, SignRoutes, SignTitle } from '@/components/ui/sign';

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

function SignDemo() {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Sign size="lg">
        <SignContent>
          <SignTitle>Times Sq–42 St</SignTitle>
        </SignContent>
        <SignRoutes>
          <RouteBullet route="N" size="lg" />
          <RouteBullet route="Q" size="lg" />
          <RouteBullet route="R" size="lg" />
          <RouteBullet route="W" size="lg" />
        </SignRoutes>
      </Sign>
      <Sign>
        <Arrow direction="left" />
        <SignContent>
          <SignTitle>Downtown &amp; Brooklyn</SignTitle>
          <SignDescription>Local and express trains</SignDescription>
        </SignContent>
        <SignRoutes>
          <RouteBullet route="4" />
          <RouteBullet route="5" />
          <RouteBullet route="6" />
        </SignRoutes>
      </Sign>
      <Sign size="sm">
        <SignContent>
          <SignTitle>Exit to W 43 St</SignTitle>
        </SignContent>
        <Arrow direction="up-right" />
      </Sign>
    </div>
  );
}

function CardDemo() {
  return (
    <div className="grid max-w-3xl gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekend service</CardTitle>
          <CardDescription>Sat 12:00 am to Mon 5:00 am</CardDescription>
        </CardHeader>
        <CardContent>Trains run local in both directions between 59 St–Columbus Circle and 145 St.</CardContent>
        <CardFooter>
          <Button size="sm">Details</Button>
          <Button size="sm" variant="ghost">
            Dismiss
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader variant="sign">
          <CardTitle className="text-xl">Uptown &amp; the Bronx</CardTitle>
          <CardDescription>Platform 2</CardDescription>
          <CardAction className="flex gap-1">
            <RouteBullet route="2" />
            <RouteBullet route="3" />
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <p>Next train in 3 min, then 9 min.</p>
          <p className="text-muted-foreground">Elevator to the street is in service.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  theme: ThemeDemo,
  arrow: ArrowDemo,
  button: ButtonDemo,
  card: CardDemo,
  sign: SignDemo,
  'route-bullet': RouteBulletDemo,
};
