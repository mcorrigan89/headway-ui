import type { ReactNode } from 'react';
import { CircleCheck, Construction, OctagonX, TriangleAlert, X } from 'lucide-react';

import { Alert, AlertAction, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Arrow, type Direction } from '@/components/ui/arrow';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RouteBullet } from '@/components/ui/route-bullet';
import { Sign, SignContent, SignDescription, SignRoutes, SignTitle } from '@/components/ui/sign';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>New</Badge>
      <Badge variant="secondary">Local</Badge>
      <Badge variant="outline">Express</Badge>
      <Badge variant="ok">Good service</Badge>
      <Badge variant="warning">Delays</Badge>
      <Badge variant="destructive">Suspended</Badge>
      <Badge variant="info">Planned work</Badge>
    </div>
  );
}

function AlertDemo() {
  return (
    <div className="flex max-w-2xl flex-col gap-3">
      <Alert variant="ok">
        <CircleCheck />
        <AlertTitle>
          <RouteBullet route="1" size="sm" />
          <RouteBullet route="2" size="sm" />
          <RouteBullet route="3" size="sm" />
          Good service
        </AlertTitle>
        <AlertDescription>Trains are running on or close to schedule.</AlertDescription>
      </Alert>
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>
          <RouteBullet route="N" size="sm" />
          <RouteBullet route="Q" size="sm" />
          Delays
        </AlertTitle>
        <AlertDescription>Northbound trains are delayed while we address a signal problem at Canal St.</AlertDescription>
        <AlertAction>
          <Button size="icon-sm" variant="ghost" aria-label="Dismiss">
            <X />
          </Button>
        </AlertAction>
      </Alert>
      <Alert variant="info">
        <Construction />
        <AlertTitle>
          <RouteBullet route="7" size="sm" />
          Planned work
        </AlertTitle>
        <AlertDescription>
          <p>No trains between 74 St–Broadway and Flushing–Main St, Sat and Sun.</p>
          <p>
            Take the <a href="#route-bullet">free shuttle bus</a> instead.
          </p>
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <OctagonX />
        <AlertTitle>
          <RouteBullet route="G" size="sm" />
          Suspended
        </AlertTitle>
        <AlertDescription>No service between Court Sq and Nassau Av.</AlertDescription>
      </Alert>
      <Alert>
        <CircleCheck />
        <AlertTitle>Your trip is saved</AlertTitle>
      </Alert>
    </div>
  );
}

function TabsDemo() {
  return (
    <div className="flex flex-col gap-10">
      <Tabs defaultValue="subway">
        <TabsList>
          <TabsTrigger value="subway">Subway</TabsTrigger>
          <TabsTrigger value="bus">Bus</TabsTrigger>
          <TabsTrigger value="rail">Rail</TabsTrigger>
          <TabsTrigger value="ferry" disabled>
            Ferry
          </TabsTrigger>
        </TabsList>
        <TabsContent value="subway">Status for all subway lines.</TabsContent>
        <TabsContent value="bus">Status for local, limited and Select Bus Service routes.</TabsContent>
        <TabsContent value="rail">Status for commuter rail.</TabsContent>
      </Tabs>
      <Tabs defaultValue="uptown">
        <TabsList variant="line">
          <TabsTrigger value="uptown">
            <Arrow direction="up" />
            Uptown
          </TabsTrigger>
          <TabsTrigger value="downtown">
            <Arrow direction="down" />
            Downtown
          </TabsTrigger>
        </TabsList>
        <TabsContent value="uptown">Next uptown trains: 2 min, 7 min, 12 min.</TabsContent>
        <TabsContent value="downtown">Next downtown trains: 4 min, 10 min.</TabsContent>
      </Tabs>
      <Tabs defaultValue="weekday" orientation="vertical" className="flex-row">
        <TabsList variant="line">
          <TabsTrigger value="weekday">Weekdays</TabsTrigger>
          <TabsTrigger value="saturday">Saturday</TabsTrigger>
          <TabsTrigger value="sunday">Sunday</TabsTrigger>
        </TabsList>
        <TabsContent value="weekday">Every 4 to 6 minutes from 6 am to 9 pm.</TabsContent>
        <TabsContent value="saturday">Every 8 to 10 minutes.</TabsContent>
        <TabsContent value="sunday">Every 10 to 12 minutes.</TabsContent>
      </Tabs>
    </div>
  );
}

function InputDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input placeholder="Station, address or place" aria-label="From" />
      <Input defaultValue="Union Sq–14 St" aria-label="To" />
      <Input disabled placeholder="Disabled" aria-label="Disabled" />
    </div>
  );
}

function LabelDemo() {
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Label htmlFor="label-demo">Starting station</Label>
      <Input id="label-demo" placeholder="Times Sq–42 St" />
    </div>
  );
}

function FieldDemo() {
  return (
    <form className="max-w-md" onSubmit={(e) => e.preventDefault()}>
      <FieldSet>
        <FieldLegend>Plan a trip</FieldLegend>
        <FieldDescription>We will find the fastest route, with transfers.</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="trip-from">From</FieldLabel>
            <Input id="trip-from" placeholder="Station, address or place" />
          </Field>
          <Field data-invalid>
            <FieldLabel htmlFor="trip-to">To</FieldLabel>
            <Input id="trip-to" defaultValue="Coney Island" aria-invalid aria-describedby="trip-to-error" />
            <FieldError id="trip-to-error" errors={['Choose a station from the list.']} />
          </Field>
          <Field>
            <FieldLabel htmlFor="trip-when">Leave at</FieldLabel>
            <Input id="trip-when" type="time" defaultValue="08:30" />
            <FieldDescription>Leave blank to go now.</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <Button type="submit">
              Find routes
              <Arrow data-icon="inline-end" />
            </Button>
            <Button type="reset" variant="ghost">
              Clear
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}

const DEPARTURES = [
  { route: 'Q', to: 'Coney Island–Stillwell Av', track: 'Downtown', min: 2, status: 'ok' },
  { route: 'N', to: 'Coney Island–Stillwell Av', track: 'Downtown', min: 5, status: 'warning' },
  { route: 'R', to: 'Bay Ridge–95 St', track: 'Downtown', min: 7, status: 'ok' },
  { route: 'W', to: 'Whitehall St–South Ferry', track: 'Downtown', min: 11, status: 'ok' },
] as const;

function TableDemo() {
  return (
    <div className="max-w-2xl">
      <Table>
        <TableCaption>Departures from Times Sq–42 St. Times are estimates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Route</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="text-right">Min</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEPARTURES.map((d) => (
            <TableRow key={d.route}>
              <TableCell>
                <RouteBullet route={d.route} size="sm" />
              </TableCell>
              <TableCell className="font-bold">{d.to}</TableCell>
              <TableCell>
                {d.track}
                {d.status === 'warning' && (
                  <Badge variant="warning" className="ml-2">
                    Delays
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right text-base font-bold">{d.min}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export const DEMOS: Record<string, () => ReactNode> = {
  theme: ThemeDemo,
  alert: AlertDemo,
  arrow: ArrowDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  field: FieldDemo,
  input: InputDemo,
  label: LabelDemo,
  sign: SignDemo,
  table: TableDemo,
  tabs: TabsDemo,
  'route-bullet': RouteBulletDemo,
};
