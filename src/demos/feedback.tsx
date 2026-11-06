import { useRef, useState, type ReactNode } from 'react';
import { Construction, Megaphone } from 'lucide-react';

import { Banner } from '@/components/ui/banner';
import { BusyHold } from '@/components/ui/busy-hold';
import { Button } from '@/components/ui/button';
import { ConfirmDialog, ConfirmDialogHost, confirm } from '@/components/ui/confirm-dialog';
import { ErrorPage } from '@/components/ui/error-page';
import { Input } from '@/components/ui/input';
import { KeyHint, KeyHints } from '@/components/ui/key-hints';
import { Label } from '@/components/ui/label';
import { Lightbox, type LightboxImage } from '@/components/ui/lightbox';
import { QueryState, QueryTableState, type QueryLike } from '@/components/ui/query-state';
import { RouteBullet } from '@/components/ui/route-bullet';
import { SpotlightCallout, SpotlightTour } from '@/components/ui/spotlight';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

// Demos for the feedback items, keyed by registry item name.

// ---- query state -------------------------------------------------------------

const ARRIVALS = [
  { route: 'A', to: 'Far Rockaway', track: 'Track 1', due: '2 min' },
  { route: 'C', to: 'Euclid Av', track: 'Track 1', due: '5 min' },
  { route: 'F', to: 'Coney Island', track: 'Track 3', due: '7 min' },
];

function QueryStateDemo() {
  const [status, setStatus] = useState<string>('pending');
  const query: QueryLike =
    status === 'error'
      ? { status: 'error', error: new Error('The arrivals feed did not respond.'), refetch: () => setStatus('pending') }
      : { status: status === 'pending' ? 'pending' : 'success' };
  const rows = status === 'empty' ? [] : ARRIVALS;
  return (
    <div className="grid gap-6">
      <ToggleGroup aria-label="State" value={[status]} onValueChange={(v) => v[0] && setStatus(v[0] as string)}>
        <ToggleGroupItem value="pending">Loading</ToggleGroupItem>
        <ToggleGroupItem value="error">Failed</ToggleGroupItem>
        <ToggleGroupItem value="empty">Empty</ToggleGroupItem>
        <ToggleGroupItem value="success">Loaded</ToggleGroupItem>
      </ToggleGroup>
      <QueryState query={query} what="the service status" isEmpty={rows.length === 0} empty="No trains due in the next 30 minutes.">
        {() => <p className="text-sm">{rows.length} trains due at Jay St–MetroTech in the next 10 minutes.</p>}
      </QueryState>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Route</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <QueryTableState query={query} colSpan={4} what="the arrivals" isEmpty={rows.length === 0} empty="No trains match." />
          {query.status === 'success' &&
            rows.map((r) => (
              <TableRow key={`${r.route}-${r.to}`}>
                <TableCell>
                  <RouteBullet route={r.route} size="sm" />
                </TableCell>
                <TableCell>{r.to}</TableCell>
                <TableCell>{r.track}</TableCell>
                <TableCell className="tabular-nums">{r.due}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ---- spotlight ---------------------------------------------------------------

function SpotlightDemo() {
  const faresRef = useRef<HTMLDivElement>(null);
  const [callout, setCallout] = useState(false);
  const [tour, setTour] = useState(false);
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setCallout(true)}>
          Highlight fares
        </Button>
        <Button onClick={() => setTour(true)}>Take the tour</Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div id="spot-route" className="on-sign border border-border bg-card p-5">
          <p className="text-lg font-bold">Route</p>
          <p className="text-sm text-muted-foreground">Jay St–MetroTech to 125 St · A express</p>
        </div>
        <div ref={faresRef} className="on-sign border border-border bg-card p-5">
          <p className="text-lg font-bold">Fares</p>
          <p className="text-sm text-muted-foreground">$2.90 per ride · weekly cap after 12 rides</p>
        </div>
      </div>
      <Button id="spot-save" className="w-fit">
        Save trip
      </Button>
      <SpotlightCallout target={faresRef} kind="section" label="Fares" open={callout} onOpenChange={setCallout}>
        What this trip costs, and when OMNY stops charging for the week.
      </SpotlightCallout>
      <SpotlightTour
        title="Planning a trip"
        open={tour}
        onOpenChange={setTour}
        steps={[
          { target: '#spot-route', kind: 'section', label: 'Route', body: 'Where you start, where you end, and which trains.' },
          { target: faresRef, kind: 'section', label: 'Fares', body: 'What you pay, with the weekly fare cap.' },
          { target: '#spot-save', label: 'Save trip', body: 'Keep it, and hear about service changes on these lines.' },
        ]}
      />
    </div>
  );
}

// ---- confirm dialog -----------------------------------------------------------

function ConfirmDialogDemo() {
  const [answer, setAnswer] = useState<string>('');
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ConfirmDialog
        trigger={<Button variant="outline">Suspend service</Button>}
        title="Suspend the G between Court Sq and Bedford–Nostrand?"
        description="Trains stop at once and riders see the change on every countdown clock."
        details={['14 scheduled trips are cancelled', 'Shuttle buses are requested for 9 stations']}
        confirmLabel="Suspend service"
        destructive
        onConfirm={() => new Promise((resolve) => setTimeout(resolve, 1200))}
      />
      <Button
        variant="secondary"
        onClick={async () =>
          setAnswer(
            (await confirm({ title: 'Publish this service notice?', confirmLabel: 'Publish notice' })) ? 'Published' : 'Not published',
          )
        }
      >
        Publish notice
      </Button>
      {answer && <span className="text-sm text-muted-foreground">{answer}</span>}
      <ConfirmDialogHost />
    </div>
  );
}

// ---- banner -------------------------------------------------------------------

function BannerDemo() {
  return (
    <div className="grid gap-4">
      <Banner
        icon={<Megaphone />}
        title="OMNY fare capping now covers express buses."
        action={
          <Button size="sm" variant="outline">
            Learn more
          </Button>
        }
        dismissible
      />
      <Banner
        tone="warning"
        icon={<Construction />}
        routes={['A', 'C']}
        title="No trains between Jay St–MetroTech and Euclid Av"
        collapsible
        items={['Weekends, 11:45 PM Fri to 5 AM Mon, Nov 7 – 17', 'Take free shuttle buses, which stop at all stations']}
        action={
          <Button size="sm" variant="secondary">
            Plan a trip
          </Button>
        }
      />
      <Banner tone="ok" routes={['7']} title="Good service" description="Trains are running on or close to schedule." />
    </div>
  );
}

// ---- lightbox -----------------------------------------------------------------

/** a drawn station plan, as a data URL, so the demo needs no external image */
function stationSheet(title: string, sheet: string, body: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1275" height="1650" viewBox="0 0 1275 1650">
<rect width="1275" height="1650" fill="#fff"/>
<rect x="40" y="40" width="1195" height="1570" fill="none" stroke="#111" stroke-width="3"/>
<rect x="40" y="1460" width="1195" height="150" fill="#111"/>
<rect x="40" y="1476" width="1195" height="3" fill="#fff"/>
<text x="70" y="1550" font-family="Helvetica, Arial" font-weight="bold" font-size="40" fill="#fff">${title}</text>
<text x="1200" y="1550" font-family="Helvetica, Arial" font-weight="bold" font-size="48" text-anchor="end" fill="#fff">${sheet}</text>
${body}
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const MEZZANINE = stationSheet(
  'Jay St–MetroTech · Mezzanine',
  'p. 1',
  `<rect x="160" y="200" width="955" height="300" fill="#ececec" stroke="#111" stroke-width="3"/>
<text x="640" y="360" font-family="Helvetica, Arial" font-size="34" text-anchor="middle" fill="#111">FARE CONTROL</text>
<rect x="160" y="620" width="955" height="140" fill="#fff" stroke="#111" stroke-width="3"/>
<text x="640" y="700" font-family="Helvetica, Arial" font-size="28" text-anchor="middle" fill="#111">A C F R PLATFORMS ↓</text>
<rect x="220" y="1040" width="420" height="80" fill="#fff" stroke="#111" stroke-width="3"/>
<text x="240" y="1095" font-family="Helvetica, Arial" font-size="30" fill="#111">ELEVATOR TO STREET</text>`,
);

const PLATFORM = stationSheet(
  'Jay St–MetroTech · Platforms',
  'p. 2',
  `<rect x="200" y="260" width="880" height="200" fill="#ececec" stroke="#111" stroke-width="3"/>
<text x="640" y="370" font-family="Helvetica, Arial" font-size="30" text-anchor="middle" fill="#111">UPTOWN A C F</text>
<rect x="200" y="620" width="880" height="200" fill="#ececec" stroke="#111" stroke-width="3"/>
<text x="640" y="730" font-family="Helvetica, Arial" font-size="30" text-anchor="middle" fill="#111">DOWNTOWN A C F</text>
<text x="200" y="1100" font-family="Helvetica, Arial" font-size="26" fill="#111">STAIR CLOSED FOR REPAIRS UNTIL DEC 12</text>`,
);

const PAGES: LightboxImage[] = [
  {
    src: MEZZANINE,
    alt: 'Jay St–MetroTech mezzanine plan',
    caption: 'station-map.pdf · p. 1',
    description: 'The street elevator, by fare control',
    regions: [{ x: 0.17, y: 0.63, width: 0.34, height: 0.05, label: 'Elevator to street' }],
  },
  {
    src: PLATFORM,
    alt: 'Jay St–MetroTech platform plan',
    caption: 'station-map.pdf · p. 2',
    description: 'Closed stair, flagged in the accessibility survey',
    regions: [
      { x: 0.15, y: 0.645, width: 0.6, height: 0.035, label: 'Closed stair note' },
      { x: 0.5, y: 0.45, label: 'Downtown platform' },
    ],
  },
];

function LightboxDemo() {
  return (
    <div className="flex flex-wrap gap-3">
      <Lightbox images={PAGES} trigger={<Button variant="outline">Open the station map</Button>} />
      <Lightbox images={[PAGES[1]!]} trigger={<Button variant="ghost">Single page</Button>} />
    </div>
  );
}

// ---- busy hold ----------------------------------------------------------------

function BusyHoldDemo() {
  const [busy, setBusy] = useState(false);
  const plan = () => {
    setBusy(true);
    window.setTimeout(() => setBusy(false), 8000);
  };
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div>
        <Button onClick={plan} disabled={busy}>
          Plan around the weekend work
        </Button>
      </div>
      <BusyHold busy={busy} label="Planning around the A and C weekend work">
        <div className="on-sign flex flex-col gap-4 border border-border bg-card p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bh-note">Note to riders</Label>
            <Textarea id="bh-note" defaultValue="Take the F to Jay St–MetroTech and transfer to shuttle buses." />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="bh-from">From</Label>
            <Input id="bh-from" defaultValue="Hoyt–Schermerhorn Sts" />
          </div>
          <div className="flex gap-3">
            <Button>Save</Button>
            <Button variant="outline">Discard</Button>
          </div>
        </div>
      </BusyHold>
    </div>
  );
}

// ---- error page ---------------------------------------------------------------

function ErrorPageDemo() {
  const [variant, setVariant] = useState<'error' | 'not-found'>('error');
  const error = new Error('GET /api/stations/A41/arrivals failed: 503 Service Unavailable');
  return (
    <div className="flex flex-col gap-4">
      <ToggleGroup value={[variant]} onValueChange={(v: string[]) => v[0] && setVariant(v[0] as typeof variant)} aria-label="Which page">
        <ToggleGroupItem value="error">Error</ToggleGroupItem>
        <ToggleGroupItem value="not-found">Not found</ToggleGroupItem>
      </ToggleGroup>
      <div className="border border-border">
        {variant === 'error' ? (
          <ErrorPage error={error} reference="req_7f3a91c2" onRetry={() => undefined} onBack={() => undefined} homeHref="#/" />
        ) : (
          <ErrorPage variant="not-found" homeHref="#/" homeLabel="Go to Service status" />
        )}
      </div>
    </div>
  );
}

// ---- key hints ----------------------------------------------------------------

function KeyHintsDemo() {
  return (
    <div className="flex flex-col gap-6">
      <KeyHints>
        <KeyHint keys={['J', 'K']}>next / previous train</KeyHint>
        <KeyHint keys={['⌘', 'K']}>find a station</KeyHint>
        <KeyHint keys={['1', '7']} range>
          open line
        </KeyHint>
      </KeyHints>
      <KeyHints className="flex-wrap border-t border-border pt-4">
        <KeyHint keys={['S']}>save trip</KeyHint>
        <KeyHint keys={['A']}>step-free only</KeyHint>
        <KeyHint keys={['Esc']}>close</KeyHint>
      </KeyHints>
    </div>
  );
}

export const FEEDBACK_DEMOS: Record<string, () => ReactNode> = {
  'confirm-dialog': ConfirmDialogDemo,
  spotlight: SpotlightDemo,
  lightbox: LightboxDemo,
  banner: BannerDemo,
  'query-state': QueryStateDemo,
  'busy-hold': BusyHoldDemo,
  'error-page': ErrorPageDemo,
  'key-hints': KeyHintsDemo,
};
