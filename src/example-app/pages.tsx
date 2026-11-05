import { useState, type ReactNode } from 'react';
import { ArrowRight, Construction, Megaphone, Plus, TrafficCone } from 'lucide-react';
import { toast } from 'sonner';

import { DataTable, dataTableColumns } from '@/components/blocks/data-table';
import { WeekCalendar, weekStartOf, type WeekCalendarEvent } from '@/components/blocks/week-calendar';
import { Banner } from '@/components/ui/banner';
import { Button, buttonVariants } from '@/components/ui/button';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { EventLog, EventLogItem } from '@/components/ui/event-log';
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { KeyHint, KeyHints } from '@/components/ui/key-hints';
import { Meter } from '@/components/ui/meter';
import { PageHeader } from '@/components/ui/page-header';
import { Readout } from '@/components/ui/readout';
import { RelativeTime } from '@/components/ui/relative-time';
import { RouteBullet, routeColor } from '@/components/ui/route-bullet';
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control';
import { Sign, SignContent, SignDescription, SignRoutes, SignTitle } from '@/components/ui/sign';
import { StripMap } from '@/components/ui/strip-map';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToneBadge } from '@/components/ui/tone-badge';
import { useHotkeys } from '@/hooks/use-hotkeys';
import { cn } from '@/lib/utils';

import {
  ALERT_STATUS,
  ALERTS,
  EVENTS,
  minutesAgo,
  PLANNED,
  ROUTES,
  routeById,
  STATUS,
  TRUNKS,
  type Route,
  type ServiceAlert,
} from './data';

// the page body: Headway's gutter, a page header, then sections
function Page({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-10">{children}</div>;
}

function Section({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-2">
        <h2 className="text-xl font-bold tracking-tight">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

const Bullets = ({ routes, size = 'sm' }: { routes: string[]; size?: 'sm' | 'default' }) => (
  <span className="flex shrink-0 gap-1">
    {routes.map((r) => (
      <RouteBullet key={r} route={r} size={size} />
    ))}
  </span>
);

// ── Service status (home) ────────────────────────────────────────────────────

export function StatusPage() {
  const inService = ROUTES.reduce((n, r) => n + r.trains[0], 0);
  const scheduled = ROUTES.reduce((n, r) => n + r.trains[1], 0);
  const affected = ROUTES.filter((r) => r.status !== 'good');
  const open = ALERTS.filter((a) => a.status !== 'resolved');

  return (
    <Page>
      <PageHeader
        eyebrow="Rapid Transit Operations"
        title="Service status"
        subtitle={`${affected.length} of ${ROUTES.length} lines need attention right now.`}
        actions={
          <a href="#/alerts" className={buttonVariants({})}>
            Service alerts <ArrowRight data-icon="inline-end" />
          </a>
        }
      />
      <div className="flex flex-col gap-3">
        <Banner
          tone="destructive"
          icon={<TrafficCone />}
          routes={['G']}
          title="No G trains between Court Sq and Nassau Av"
          collapsible
          items={['Track replacement until 5 AM tomorrow', 'Free shuttle buses every 8 minutes, stopping at 21 St and Greenpoint Av']}
          action={
            <a href="#/lines/g" className={buttonVariants({ size: 'sm', variant: 'secondary' })}>
              See the G
            </a>
          }
          contained={false}
        />
        <Banner icon={<Megaphone />} routes={['N']} title="This weekend, N trains run local in Manhattan" dismissible contained={false} />
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        <Readout label="Trains in service" value={inService} tone={inService < scheduled - 10 ? 'warning' : 'ok'} />
        <Readout label="Scheduled at this hour" value={scheduled} />
        <Readout label="Lines with delays" value={ROUTES.filter((r) => r.status === 'delays').length} tone="warning" />
        <Readout label="Open alerts" value={open.length} tone={open.length ? 'destructive' : 'ok'} />
      </div>

      <Section title="Lines" aside={<span className="text-sm text-muted-foreground">grouped by trunk line</span>}>
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-2">
          {TRUNKS.map((trunk) => (
            <div key={trunk} className="flex flex-col">
              <h3 className="pb-1 text-sm font-bold text-muted-foreground">{trunk}</h3>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {ROUTES.filter((r) => r.trunk === trunk).map((r) => (
                  <li key={r.id}>
                    <LineRow route={r} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  );
}

function LineRow({ route }: { route: Route }) {
  const status = STATUS[route.status];
  return (
    <a
      href={`#/lines/${route.id.toLowerCase()}`}
      className="group flex items-center gap-3 py-2.5 outline-none hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
    >
      <RouteBullet route={route.id} express={route.express} />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-bold group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">{route.name}</span>
        {route.note && <span className="truncate text-sm text-muted-foreground">{route.note}</span>}
      </span>
      <ToneBadge tone={status.tone}>{status.label}</ToneBadge>
    </a>
  );
}

// ── one line ─────────────────────────────────────────────────────────────────

export function LinePage({ id }: { id: string }) {
  const route = routeById(id);
  if (!route) return <NotInSample title="No such line" />;
  const status = STATUS[route.status];
  const events = EVENTS.filter((e) => e.route === route.id);
  const stops = route.stations.map((name) => {
    const others = ROUTES.filter((r) => r.id !== route.id && r.stations.includes(name)).map((r) => r.id);
    return { label: name, transfers: others.length ? <Bullets routes={others.slice(0, 5)} /> : undefined };
  });

  return (
    <Page>
      <a
        href="#/"
        className="w-fit text-sm font-bold underline decoration-2 underline-offset-4 outline-none hover:decoration-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring"
      >
        ← Service status
      </a>
      <Sign>
        <SignRoutes>
          <RouteBullet route={route.id} express={route.express} size="lg" />
        </SignRoutes>
        <SignContent>
          <SignTitle>
            <h1>{route.name}</h1>
          </SignTitle>
          <SignDescription>
            {route.terminals[0]} – {route.terminals[1]}
          </SignDescription>
        </SignContent>
      </Sign>
      {route.status !== 'good' && (
        <Banner
          tone={status.tone === 'info' ? 'info' : status.tone === 'warning' ? 'warning' : 'destructive'}
          routes={[route.id]}
          title={`${status.label}: ${route.note ?? ''}`}
          contained={false}
        />
      )}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Section
          title="Where the next train is"
          aside={<span className="text-sm text-muted-foreground">towards {route.terminals[1]}</span>}
        >
          <StripMap route={route.id} current={route.trainAt} orientation="vertical" stops={stops} aria-label={`${route.id} train stops`} />
        </Section>
        <div className="flex flex-col gap-10">
          <Section title="Right now">
            <ToneBadge tone={status.tone} className="w-fit">
              {status.label}
            </ToneBadge>
            <Meter
              label="Trains in service"
              value={route.trains[0]}
              total={route.trains[1]}
              tone={route.trains[0] < route.trains[1] ? 'warning' : 'ok'}
            />
            <DescriptionList layout="inline" divided>
              <DescriptionItem>
                <DescriptionTerm>Trunk</DescriptionTerm>
                <DescriptionDetails>{route.trunk}</DescriptionDetails>
              </DescriptionItem>
              <DescriptionItem>
                <DescriptionTerm>Peak headway</DescriptionTerm>
                <DescriptionDetails>every {route.headway} min</DescriptionDetails>
              </DescriptionItem>
              <DescriptionItem>
                <DescriptionTerm>Stations</DescriptionTerm>
                <DescriptionDetails>{route.stations.length}</DescriptionDetails>
              </DescriptionItem>
              <DescriptionItem>
                <DescriptionTerm>Service</DescriptionTerm>
                <DescriptionDetails>{route.express ? 'Express' : 'Local'}</DescriptionDetails>
              </DescriptionItem>
            </DescriptionList>
          </Section>
          <Section title="Today">
            {events.length ? (
              <EventLog aria-label={`${route.id} line today`}>
                {events
                  .slice()
                  .sort((a, b) => a.ago - b.ago)
                  .map((e) => (
                    <EventLogItem key={e.id} time={<RelativeTime date={minutesAgo(e.ago)} />} tag={e.source} tone={e.tone}>
                      {e.text}
                    </EventLogItem>
                  ))}
              </EventLog>
            ) : (
              <p className="text-muted-foreground">Nothing logged on the {route.id} today.</p>
            )}
          </Section>
        </div>
      </div>
    </Page>
  );
}

// ── service alerts ───────────────────────────────────────────────────────────

const col = dataTableColumns<ServiceAlert>();
const COLUMNS = col.columns([
  col.accessor('id', { header: 'Alert', cell: (c) => <span className="font-bold tabular-nums">{c.getValue()}</span> }),
  col.accessor((a) => a.routes.join(' '), { id: 'lines', header: 'Lines', cell: (c) => <Bullets routes={c.row.original.routes} /> }),
  col.accessor('station', { header: 'Station' }),
  col.accessor('kind', { header: 'Kind' }),
  col.accessor((a) => ALERT_STATUS[a.status].label, {
    id: 'status',
    header: 'Status',
    cell: (c) => <ToneBadge tone={ALERT_STATUS[c.row.original.status].tone}>{c.getValue()}</ToneBadge>,
  }),
  col.accessor('riders', { header: 'Riders told', cell: (c) => <span className="tabular-nums">{c.getValue().toLocaleString()}</span> }),
  col.accessor('ago', { header: 'Raised', cell: (c) => <RelativeTime date={minutesAgo(c.getValue())} /> }),
  col.accessor('owner', { header: 'Owner' }),
]);

export function AlertsPage() {
  const [alerts, setAlerts] = useState(ALERTS);
  const [composing, setComposing] = useState(false);
  const [view, setView] = useState<'active' | 'all'>('active');
  const shown = view === 'active' ? alerts.filter((a) => a.status !== 'resolved') : alerts;
  // N opens the form; the table's own searchShortcut takes /
  useHotkeys({ n: () => setComposing(true) });

  const resolve = (rows: ServiceAlert[]) => {
    const ids = new Set(rows.map((r) => r.id));
    setAlerts((all) => all.map((a) => (ids.has(a.id) ? { ...a, status: 'resolved' } : a)));
    toast.success(`Resolved ${rows.length} ${rows.length === 1 ? 'alert' : 'alerts'}`);
  };

  return (
    <Page>
      <PageHeader
        title="Service alerts"
        count={shown.length}
        subtitle="What riders are being told, and who owns it."
        actions={
          <Button onClick={() => setComposing(true)}>
            <Plus data-icon="inline-start" /> New alert
          </Button>
        }
      />
      <div className="flex flex-col gap-4">
        <SegmentedControl aria-label="Which alerts" value={view} onValueChange={setView} size="sm" fitContent>
          <SegmentedControlItem value="active">Active</SegmentedControlItem>
          <SegmentedControlItem value="all">All today</SegmentedControlItem>
        </SegmentedControl>
        <DataTable
          key={view}
          columns={COLUMNS}
          data={shown}
          getRowId={(a) => a.id}
          rowLabel={(a) => a.id}
          pageSize={8}
          filterPlaceholder="Filter by station, line or kind"
          searchShortcut
          selectable={(a) => a.status !== 'resolved'}
          emptyTitle="No active alerts"
          emptyDescription="Every line is running normally."
          bulkActions={(rows, clear) => (
            <Button
              size="sm"
              onClick={() => {
                resolve(rows);
                clear();
              }}
            >
              Resolve
            </Button>
          )}
        />
        <KeyHints>
          <KeyHint keys={['N']}>new alert</KeyHint>
          <KeyHint keys={['/']}>filter</KeyHint>
        </KeyHints>
      </div>
      <NewAlertDialog
        open={composing}
        onOpenChange={setComposing}
        onCreate={(a) => {
          setAlerts((all) => [a, ...all]);
          setView('active');
          toast.success(`${a.id} sent to riders on the ${a.routes.join(', ')}`);
        }}
        nextId={`SA-0${430 + alerts.length - ALERTS.length}`}
      />
    </Page>
  );
}

function NewAlertDialog({
  open,
  onOpenChange,
  onCreate,
  nextId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (alert: ServiceAlert) => void;
  nextId: string;
}) {
  const [routes, setRoutes] = useState<string[]>([]);
  const [station, setStation] = useState('');
  const [kind, setKind] = useState<'delays' | 'reroute' | 'suspended'>('delays');
  const [message, setMessage] = useState('');
  const [notify, setNotify] = useState(true);
  const [tried, setTried] = useState(false);
  const invalid = routes.length === 0 || !station.trim();

  const reset = () => {
    setRoutes([]);
    setStation('');
    setKind('delays');
    setMessage('');
    setNotify(true);
    setTried(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) reset();
      }}
    >
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New service alert</DialogTitle>
          <DialogDescription>Riders following these lines get it by push and email.</DialogDescription>
        </DialogHeader>
        <form
          id="new-alert"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setTried(true);
            if (invalid) return;
            onCreate({
              id: nextId,
              routes,
              station: station.trim(),
              kind: kind === 'delays' ? 'Delays' : kind === 'reroute' ? 'Reroute' : 'Suspension',
              status: 'open',
              riders: notify ? routes.length * 1200 : 0,
              ago: 0,
              owner: 'Dana Ruiz',
            });
            onOpenChange(false);
            reset();
          }}
        >
          <FieldGroup>
            <FieldSet data-invalid={tried && routes.length === 0 ? true : undefined}>
              <FieldLegend>Lines affected</FieldLegend>
              <ToggleGroup multiple value={routes} onValueChange={(v: string[]) => setRoutes(v)} className="flex-wrap">
                {ROUTES.map((r) => (
                  <ToggleGroupItem key={r.id} value={r.id} aria-label={`${r.id} train`} className="size-10 p-0">
                    <RouteBullet route={r.id} size="sm" aria-hidden />
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              {tried && routes.length === 0 && <p className="text-sm text-error">Pick at least one line.</p>}
            </FieldSet>
            <Field data-invalid={tried && !station.trim() ? true : undefined}>
              <FieldLabel htmlFor="alert-station">Station</FieldLabel>
              <Input
                id="alert-station"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                aria-invalid={tried && !station.trim() ? true : undefined}
                placeholder="e.g. Jay St–MetroTech"
              />
              {tried && !station.trim() && <p className="text-sm text-error">Say where it is.</p>}
            </Field>
            <Field>
              <FieldLabel id="alert-kind">What riders should expect</FieldLabel>
              <SegmentedControl aria-labelledby="alert-kind" value={kind} onValueChange={setKind} size="sm" fitContent>
                <SegmentedControlItem value="delays">Delays</SegmentedControlItem>
                <SegmentedControlItem value="reroute">Reroute</SegmentedControlItem>
                <SegmentedControlItem value="suspended">Suspended</SegmentedControlItem>
              </SegmentedControl>
            </Field>
            <Field>
              <FieldLabel htmlFor="alert-message">Message</FieldLabel>
              <Textarea
                id="alert-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What happened and what to do instead"
              />
            </Field>
            <Field orientation="horizontal">
              <Switch id="alert-notify" checked={notify} onCheckedChange={setNotify} />
              <FieldLabel htmlFor="alert-notify">Notify riders now</FieldLabel>
            </Field>
            <FieldDescription>Saved as open under your name; you can resolve it from the list.</FieldDescription>
          </FieldGroup>
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="new-alert">
            Send alert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── planned work ─────────────────────────────────────────────────────────────

export function PlannedPage() {
  // this week's Monday, worked out once
  const [monday] = useState(() => weekStartOf(new Date()));
  const events: WeekCalendarEvent[] = PLANNED.map((p) => {
    const start = new Date(monday);
    start.setDate(start.getDate() + p.day);
    start.setHours(p.start, 0, 0, 0);
    const route = routeById(p.route)!;
    return {
      id: p.id,
      title: `${p.route} · ${p.title}`,
      subtitle: p.where,
      start,
      end: new Date(start.getTime() + p.hours * 3_600_000),
      tone: 'info',
      // the route's own colour on the event's edge
      line: routeColor(route.id),
      meta: route.name,
      href: `#/lines/${p.route.toLowerCase()}`,
    };
  });
  return (
    <Page>
      <PageHeader title="Planned work" count={PLANNED.length} subtitle="Track, signal and station work booked this week." />
      <WeekCalendar events={events} startHour={7} endHour={24} />
    </Page>
  );
}

// ── everything the sample doesn't build ─────────────────────────────────────

export function NotInSample({ title }: { title: string }) {
  return (
    <Page>
      <PageHeader title={title} />
      <Empty className={cn('border-2 border-dashed border-border py-16')}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction />
          </EmptyMedia>
          <EmptyTitle>Not in this sample</EmptyTitle>
          <EmptyDescription>The sample builds service status, a line, service alerts and planned work.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <a href="#/" className={buttonVariants({ variant: 'outline' })}>
            Back to service status
          </a>
        </EmptyContent>
      </Empty>
    </Page>
  );
}
