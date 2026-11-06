import { useRef, useState, type ReactNode } from 'react';

import { Deadline } from '@/components/ui/deadline';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Distribution } from '@/components/ui/distribution';
import { EventLog, EventLogEmpty, EventLogFilter, EventLogItem, type EventLogTone } from '@/components/ui/event-log';
import { Highlight, SearchHit } from '@/components/ui/highlight';
import { Input } from '@/components/ui/input';
import { Meter } from '@/components/ui/meter';
import { QuickTip } from '@/components/ui/quick-tip';
import { Readout } from '@/components/ui/readout';
import { RelativeTime } from '@/components/ui/relative-time';
import { Steps } from '@/components/ui/steps';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToneBadge, type Tone } from '@/components/ui/tone-badge';

// Demos for the instruments: status, counts, timelines and facts, keyed by
// registry item name.

const DAY = 86_400_000;
const inDays = (n: number, hour = 17, from = Date.now()) => {
  const d = new Date(from + n * DAY);
  d.setHours(hour, 0, 0, 0);
  return d;
};

function QuickTipDemo() {
  return (
    <div className="grid gap-4 text-sm">
      <p className="flex items-center gap-1 font-bold">
        Reduced fare <QuickTip content="Half the full fare, for riders 65 and over and riders with a qualifying disability." />
      </p>
      <p className="flex items-center gap-1 font-bold">
        Fare cap <QuickTip trigger="hover" label="About the fare cap" content="12 paid rides in 7 days" />
      </p>
    </div>
  );
}

function ToneBadgeDemo() {
  const rows: { line: string; segment: string; status: string; tone: Tone }[] = [
    { line: 'A', segment: 'Inwood–207 St to Far Rockaway', status: 'Good service', tone: 'ok' },
    { line: 'F', segment: 'Jamaica–179 St to Coney Island', status: 'Delays', tone: 'warning' },
    { line: 'G', segment: 'Court Sq to Church Av', status: 'Suspended', tone: 'destructive' },
    { line: 'L', segment: '8 Av to Canarsie–Rockaway Pkwy', status: 'Planned work', tone: 'info' },
    { line: 'S', segment: 'Rockaway Park Shuttle', status: 'Part time', tone: 'dim' },
  ];
  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <ToneBadge>Scheduled</ToneBadge>
        <ToneBadge tone="ok">Good service</ToneBadge>
        <ToneBadge tone="info">Planned work</ToneBadge>
        <ToneBadge tone="warning">Delays</ToneBadge>
        <ToneBadge tone="destructive">Suspended</ToneBadge>
        <ToneBadge tone="muted">No service</ToneBadge>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Line</TableHead>
            <TableHead>Segment</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.line}>
              <TableCell>{r.line}</TableCell>
              <TableCell>{r.segment}</TableCell>
              <TableCell>
                <ToneBadge tone={r.tone}>{r.status}</ToneBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function DeadlineDemo() {
  const [now] = useState(() => Date.now());
  const rows: { label: string; node: ReactNode }[] = [
    { label: 'Refund claim · RC-2026-0142', node: <Deadline due={inDays(12)} showDate /> },
    { label: 'Reduced-fare renewal · RF-88213', node: <Deadline due={inDays(2)} /> },
    { label: 'Lost property pickup · LP-0131', node: <Deadline due={inDays(0, 23)} /> },
    { label: 'Fare appeal · FA-2026-0088', node: <Deadline due={inDays(-2)} /> },
    { label: 'Weekend shuttle notice · SC-0120', node: <Deadline due={new Date(now + 5 * 3_600_000)} precision="hour" /> },
    { label: 'Elevator repair · Jay St–MetroTech', node: <Deadline due={inDays(20)} status="paused" remainingDays={9} /> },
    { label: 'Card replacement · OMNY-4410', node: <Deadline due={inDays(-1)} status="met" metAt={inDays(-3)} /> },
  ];
  return (
    <div className="flex flex-col gap-8">
      <ul className="flex flex-col divide-y divide-border border border-border">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <span>{r.label}</span>
            {r.node}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-2">
        <Deadline variant="badge" due={inDays(12)} />
        <Deadline variant="badge" due={inDays(1)} />
        <Deadline variant="badge" due={inDays(-4)} />
        <Deadline variant="badge" due={inDays(6)} status="paused" />
        <Deadline variant="badge" due={inDays(-1)} status="met" />
      </div>
    </div>
  );
}

function RelativeTimeDemo() {
  const [now] = useState(() => Date.now());
  const rows = [
    { what: 'Northbound F train arriving at Bergen St', at: now - 20_000 },
    { what: 'Delays cleared on the 4 5 6', at: now - 5 * 60_000 },
    { what: 'Elevator back in service at 14 St–Union Sq', at: now - 3 * 3_600_000 },
    { what: 'Refund issued to your OMNY card', at: now - DAY - 3_600_000 },
    { what: 'Escalator outage reported at Roosevelt Island', at: now - 16 * DAY },
    { what: 'Weekend G shuttle buses begin', at: now + 2 * DAY + 3_600_000 },
  ];
  return (
    <ul className="flex flex-col divide-y divide-border border border-border">
      {rows.map((r) => (
        <li key={r.what} className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
          <span>{r.what}</span>
          <RelativeTime date={r.at} className="text-sm text-muted-foreground" />
        </li>
      ))}
      <li className="flex flex-wrap items-baseline justify-between gap-3 px-4 py-3">
        <span>Short and narrow styles</span>
        <span className="flex gap-4 text-sm text-muted-foreground">
          <RelativeTime date={now - 5 * 60_000} style="short" />
          <RelativeTime date={now - 5 * 60_000} style="narrow" />
        </span>
      </li>
    </ul>
  );
}

function ReadoutDemo() {
  return (
    <div className="flex flex-wrap gap-10">
      <Readout label="Next Manhattan-bound L" value="3 min" />
      <Readout label="Trains in service" value="412" tone="ok" />
      <Readout label="Lines with delays" value="4" tone="warning" />
      <Readout label="Elevators out" value="9" tone="destructive" />
      <Readout label="Shuttles parked" value="12" tone="dim" />
    </div>
  );
}

function MeterDemo() {
  return (
    <div className="flex flex-col gap-6">
      <Meter label="Elevators working at Fulton St" value={3} total={5} />
      <Meter label="Cars in service on train 2B" value={9} total={10} tone="ok" />
      <Meter label="Fare machines out of order" value={2} total={6} tone="destructive" />
    </div>
  );
}

function DistributionDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Distribution
        label="Weekday riders by line"
        parts={[
          { name: 'A C E', count: 112, tone: 'line-blue' },
          { name: 'B D F M', count: 98, tone: 'line-orange' },
          { name: 'N Q R W', count: 64, tone: 'line-yellow' },
          { name: '4 5 6', count: 203, tone: 'line-green' },
          { name: '7', count: 41, tone: 'line-purple' },
        ]}
      />
      <Distribution
        label="Delays this week by cause"
        parts={[
          { name: 'Signals', count: 28 },
          { name: 'Sick passenger', count: 17 },
          { name: 'Track work', count: 12 },
          { name: 'Planned', count: 18, tone: 'info', dashed: true },
        ]}
      />
    </div>
  );
}

type Source = 'all' | 'dispatch' | 'automation' | 'rider';
type Activity = { id: number; time: string; source: Exclude<Source, 'all'>; text: string; tone?: EventLogTone; end?: ReactNode };

const SOURCE_LABEL = { dispatch: 'Dispatch', automation: 'Automation', rider: 'Rider report' } as const;
const SOURCE_BADGE = { dispatch: 'default', automation: 'info', rider: 'secondary' } as const;

function EventLogDemo() {
  const [source, setSource] = useState<Source>('all');
  const [events, setEvents] = useState<Activity[]>([
    { id: 5, time: 'Today, 2:14 PM', source: 'dispatch', text: 'Service restored on the F between Jay St and Church Av', tone: 'ok' },
    { id: 4, time: 'Today, 9:02 AM', source: 'automation', text: 'Alert sent to 18,204 riders following the F' },
    {
      id: 3,
      time: 'Today, 7:40 AM',
      source: 'dispatch',
      text: 'Signal problem at Bergen St: trains held',
      tone: 'destructive',
      end: <ToneBadge tone="destructive">Open</ToneBadge>,
    },
    { id: 2, time: 'Today, 7:31 AM', source: 'rider', text: 'Train stopped between stations for 10 minutes', tone: 'warning' },
    { id: 1, time: 'Today, 7:28 AM', source: 'automation', text: 'Incident INC-40822 opened' },
  ]);
  const next = useRef(6);
  const shown = source === 'all' ? events : events.filter((e) => e.source === source);
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <EventLogFilter<Source>
          value={source}
          onValueChange={setSource}
          options={[
            { value: 'all', label: 'All' },
            { value: 'dispatch', label: 'Dispatch' },
            { value: 'automation', label: 'Automation' },
            { value: 'rider', label: 'Riders' },
          ]}
        />
        <button
          type="button"
          className="text-sm font-bold underline decoration-2 underline-offset-4 outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
          onClick={() =>
            setEvents((list) => [
              { id: next.current++, time: 'Just now', source: 'automation', text: 'Incident INC-40822 closed', tone: 'info' },
              ...list,
            ])
          }
        >
          Add an event
        </button>
      </div>
      <EventLog aria-label="Incident INC-40822 activity">
        {shown.length === 0 && <EventLogEmpty>No activity from this source.</EventLogEmpty>}
        {shown.map((e) => (
          <EventLogItem key={e.id} time={e.time} tag={SOURCE_LABEL[e.source]} tagVariant={SOURCE_BADGE[e.source]} tone={e.tone} end={e.end}>
            {e.text}
          </EventLogItem>
        ))}
      </EventLog>
    </div>
  );
}

const STATION: [string, ReactNode, string | undefined][] = [
  ['Station', 'Jay St–MetroTech', undefined],
  ['Lines', 'A C F R', 'Service guide, Nov 2026'],
  ['Platforms', '2 island, 1 side', 'Station survey · imported 3 Nov 2026'],
  ['Accessible', 'Yes, elevators to all platforms', 'Elevator and escalator status feed'],
  ['Weekday riders', '41,327', 'Ridership counts, 2025 average'],
];

function DescriptionListDemo() {
  return (
    <div className="grid max-w-3xl gap-10">
      <section className="grid gap-3">
        <h3 className="text-lg font-bold tracking-tight">Inline, divided, with sources behind a “?”</h3>
        <DescriptionList layout="inline" divided>
          {STATION.map(([label, value, source]) => (
            <DescriptionItem key={label}>
              <DescriptionTerm>{label}</DescriptionTerm>
              <DescriptionDetails source={source}>{value}</DescriptionDetails>
            </DescriptionItem>
          ))}
        </DescriptionList>
      </section>
      <section className="grid gap-3">
        <h3 className="text-lg font-bold tracking-tight">Grid of three, sources as a second line</h3>
        <DescriptionList layout="grid" columns={3}>
          <DescriptionItem>
            <DescriptionTerm>Full fare</DescriptionTerm>
            <DescriptionDetails source="Fare schedule, Jan 2026" sourceDisplay="line">
              $2.90
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Reduced fare</DescriptionTerm>
            <DescriptionDetails source="Half the full fare" sourceDisplay="line">
              $1.45
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Weekly cap</DescriptionTerm>
            <DescriptionDetails source="12 paid rides in 7 days" sourceDisplay="line">
              $34.00
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Card</DescriptionTerm>
            <DescriptionDetails>OMNY •••• 4410</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Rides this week</DescriptionTerm>
            <DescriptionDetails>9</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Last transfer</DescriptionTerm>
            <DescriptionDetails />
          </DescriptionItem>
        </DescriptionList>
      </section>
      <section className="grid max-w-sm gap-3">
        <h3 className="text-lg font-bold tracking-tight">Stacked</h3>
        <DescriptionList>
          <DescriptionItem>
            <DescriptionTerm>Trip</DescriptionTerm>
            <DescriptionDetails>Bergen St to 34 St–Herald Sq</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Service change</DescriptionTerm>
            <DescriptionDetails>Weekend F trains run on the A line between Jay St and W 4 St.</DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </section>
    </div>
  );
}

function StepsDemo() {
  const [current, setCurrent] = useState(2);
  const items = [
    { title: 'Trip details', description: 'Bergen St, 3 Oct' },
    { title: 'Delay', description: '42 minutes' },
    { title: 'Refund method', description: 'Back to OMNY' },
    { title: 'Review' },
    { title: 'Submit' },
  ];
  return (
    <div className="grid gap-10">
      <Steps items={items} currentStep={current} onStepClick={(i) => i < current && setCurrent(i)} aria-label="Refund claim progress" />
      <Steps
        orientation="vertical"
        size="sm"
        currentStep={2}
        aria-label="Your trip"
        items={[
          { title: 'Walk to Bergen St', description: '4 min' },
          { title: 'F to Jay St–MetroTech', description: 'Suspended: take the shuttle bus', status: 'error' },
          { title: 'Transfer to the A', description: 'Next train in 3 min' },
          { title: 'Arrive at 34 St–Penn Station' },
        ]}
      />
    </div>
  );
}

const NOTICES = [
  {
    citation: 'SC-2026-118',
    title: 'Weekend F service change: shuttle buses replace trains',
    line: 'F line',
    body: 'Shuttle buses replace F trains between Jay St–MetroTech and Church Av this weekend while crews replace signal equipment. Free shuttle buses stop at every station; allow an extra 20 minutes for your trip.',
  },
  {
    citation: 'SC-2026-121',
    title: 'Late-night G service change',
    line: 'G line',
    body: 'From 11:30 PM to 5 AM, G trains run every 20 minutes and a free shuttle bus connects Court Sq and Nassau Av while track work continues on the Pulaski Bridge approach.',
  },
];

function HighlightDemo() {
  const [q, setQ] = useState('shuttle service change');
  const terms = q.split(/\s+/);
  return (
    <div className="grid max-w-2xl gap-6">
      <Input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search service notices" />
      <p className="text-base">
        <Highlight text="During this service change, a free shuttle runs every 8 minutes." terms={terms} />
      </p>
      <ul className="grid border-y border-border">
        {NOTICES.map((n) => (
          <li key={n.citation} className="border-b border-border last:border-b-0">
            <SearchHit citation={n.citation} title={n.title} meta={`· ${n.line}`} snippet={n.body} terms={terms} radius={70} />
          </li>
        ))}
        <li>
          <SearchHit
            citation="SC-2026-130"
            title="Escalator replacement at Roosevelt Island"
            meta="· in your saved stations"
            snippet="…use the **elevator** or the stairs; a **shuttle** bus runs to Queensboro Plaza…"
            delimiter="**"
          />
        </li>
      </ul>
    </div>
  );
}

export const INSTRUMENTS_DEMOS: Record<string, () => ReactNode> = {
  'quick-tip': QuickTipDemo,
  'tone-badge': ToneBadgeDemo,
  deadline: DeadlineDemo,
  'relative-time': RelativeTimeDemo,
  readout: ReadoutDemo,
  meter: MeterDemo,
  distribution: DistributionDemo,
  'event-log': EventLogDemo,
  'description-list': DescriptionListDemo,
  steps: StepsDemo,
  highlight: HighlightDemo,
};
