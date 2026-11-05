import { useMemo, useState, type ReactNode } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  BookOpen,
  CalendarClock,
  CircleHelp,
  Construction,
  FileBarChart,
  Footprints,
  Globe,
  ListChecks,
  Megaphone,
  ScrollText,
  Search,
  Settings,
  Siren,
  TrainFront,
  TriangleAlert,
  Users,
} from 'lucide-react';

import { AppShell, type NavSection } from '@/components/blocks/app-shell';
import { DataTable, dataTableColumns } from '@/components/blocks/data-table';
import { UserMenu, type UserMenuOrganization } from '@/components/blocks/user-menu';
import { WeekCalendar, weekStartOf, type WeekCalendarEvent } from '@/components/blocks/week-calendar';
import { Button } from '@/components/ui/button';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { RouteBullet } from '@/components/ui/route-bullet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ToneBadge, type Tone } from '@/components/ui/tone-badge';

// Demos for the blocks: a transit operations staff app — its frame, the
// service alerts table, the signed-in person's menu and the crews' week.

// ── app shell ────────────────────────────────────────────────────────────────

/** the staff nav, grouped by kind of work; `admin` decides what setup offers */
export function staffNav({ admin, crews }: { admin: boolean; crews: boolean }): NavSection[] {
  return [
    {
      title: 'Service',
      items: [
        { href: '#/', label: 'Service alerts', icon: TriangleAlert, exact: true, badge: 14 },
        { href: '#/planned', label: 'Planned work', icon: Construction },
        { href: '#/incidents', label: 'Incidents', icon: Siren, badge: 3, badgeLabel: '3 open' },
        { href: '#/walks', label: 'Track walks', icon: Footprints, badge: 128, hidden: !crews },
        { href: '#/schedule', label: 'Crew schedule', icon: CalendarClock },
        { href: '#/notices', label: 'Customer notices', icon: Megaphone },
        { href: '#/fleet', label: 'Fleet', icon: TrainFront },
      ],
    },
    {
      title: 'Insight',
      items: [
        { href: '#/reports', label: 'Reports', icon: FileBarChart },
        { href: '#/audit', label: 'Audit', icon: ScrollText, hidden: !admin },
      ],
    },
    {
      title: 'Setup',
      items: [
        { href: '#/lines', label: 'Lines and stations', icon: ListChecks, hidden: !admin },
        { href: '#/people', label: 'People', icon: Users, hidden: !admin },
      ],
    },
  ];
}

function AppShellDemo() {
  const [admin, setAdmin] = useState(true);
  return (
    <div className="h-[640px] overflow-auto border border-border">
      <AppShell
        className="min-h-full [&>aside]:h-[640px]"
        brand={{ href: '#/', name: 'Headway', caption: 'Rapid Transit Operations', routes: ['A', 'C', 'E'] }}
        sections={staffNav({ admin, crews: true })}
        footer={[
          { href: '#/site', label: 'Public site', icon: Globe },
          { href: '#/api', label: 'Feed docs', icon: BookOpen },
        ]}
        activeHref="#/incidents/INC-2026-0112"
        storageKey="headway.demo.sidebar.collapsed"
        sidebarFooter={(collapsed) => (
          <UserMenu
            variant="sidebar"
            collapsed={collapsed}
            user={{ name: 'Dana Ruiz', email: 'dana.ruiz@transit.example' }}
            organizations={[{ id: 'subways', name: 'Rapid Transit Operations', role: admin ? 'admin' : 'dispatcher' }]}
            activeOrganizationId="subways"
            onSignOut={() => {}}
          />
        )}
        renderLink={({ href, className, children, attrs, ...rest }) => (
          <a href={href} className={className} aria-current={rest['aria-current']} onClick={(e) => e.preventDefault()} {...attrs}>
            {children}
          </a>
        )}
        topBar={
          <>
            <span className="truncate font-bold">
              Rapid Transit Operations{' '}
              <span className="hidden font-normal text-muted-foreground sm:inline">· {admin ? 'admin' : 'dispatcher'}</span>
            </span>
            <div className="ml-auto flex items-center gap-2">
              <InputGroup className="hidden w-64 lg:flex">
                <InputGroupInput placeholder="Search stations…" aria-label="Search stations" />
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
              </InputGroup>
              <Button variant="outline" size="sm" onClick={() => setAdmin(!admin)}>
                View as {admin ? 'dispatcher' : 'admin'}
              </Button>
            </div>
          </>
        }
      >
        <h1 className="text-3xl font-bold tracking-tight">Incidents</h1>
        <p className="mt-2 text-muted-foreground">
          Three incidents are open on the 8 Av line. Setup appears only for admins; switch the view to see the nav change.
        </p>
      </AppShell>
    </div>
  );
}

// ── data table ───────────────────────────────────────────────────────────────

export type Alert = {
  id: string;
  lines: string;
  station: string;
  kind: string;
  status: 'Delays' | 'Resolved' | 'Suspended' | 'Reported';
  riders: number;
  reported: string;
  crew: string;
};

export const ALERTS: Alert[] = [
  {
    id: 'SA-2026-0418',
    lines: 'A C',
    station: 'Jay St–MetroTech',
    kind: 'Signal problem',
    status: 'Delays',
    riders: 1240,
    reported: '2026-10-02',
    crew: 'D. Okafor',
  },
  {
    id: 'SA-2026-0419',
    lines: '1',
    station: 'Dyckman St',
    kind: 'Sick passenger',
    status: 'Resolved',
    riders: 310,
    reported: '2026-10-03',
    crew: 'R. Chen',
  },
  {
    id: 'SA-2026-0423',
    lines: 'G',
    station: 'Hoyt–Schermerhorn',
    kind: 'Track maintenance',
    status: 'Suspended',
    riders: 4820,
    reported: '2026-10-06',
    crew: 'D. Okafor',
  },
  {
    id: 'SA-2026-0427',
    lines: 'L',
    station: 'Bedford Av',
    kind: 'Train cleaning',
    status: 'Resolved',
    riders: 185,
    reported: '2026-10-07',
    crew: 'M. Alvarez',
  },
  {
    id: 'SA-2026-0431',
    lines: 'N Q R W',
    station: 'Canal St',
    kind: 'Electrical problem',
    status: 'Reported',
    riders: 2650,
    reported: '2026-10-09',
    crew: 'Unassigned',
  },
  {
    id: 'SA-2026-0436',
    lines: '7',
    station: 'Hunters Point Av',
    kind: 'Police activity',
    status: 'Delays',
    riders: 95,
    reported: '2026-10-12',
    crew: 'R. Chen',
  },
  {
    id: 'SA-2026-0440',
    lines: 'J Z',
    station: 'Marcy Av',
    kind: 'Switch problem',
    status: 'Suspended',
    riders: 720,
    reported: '2026-10-14',
    crew: 'M. Alvarez',
  },
  {
    id: 'SA-2026-0444',
    lines: '4 5 6',
    station: 'Grand Central',
    kind: 'Signal upgrade',
    status: 'Resolved',
    riders: 150,
    reported: '2026-10-16',
    crew: 'R. Chen',
  },
  {
    id: 'SA-2026-0447',
    lines: 'B D F M',
    station: 'W 4 St–Wash Sq',
    kind: 'Station rehabilitation',
    status: 'Reported',
    riders: 900,
    reported: '2026-10-20',
    crew: 'Unassigned',
  },
  {
    id: 'SA-2026-0452',
    lines: 'E',
    station: 'Briarwood',
    kind: 'Water condition',
    status: 'Delays',
    riders: 60,
    reported: '2026-10-22',
    crew: 'D. Okafor',
  },
];

const STATUS_TONE: Record<Alert['status'], Tone> = { Delays: 'warning', Resolved: 'ok', Suspended: 'destructive', Reported: 'neutral' };

const count = (n: number) => n.toLocaleString('en-US');

const col = dataTableColumns<Alert>();
const ALERT_COLUMNS = col.columns([
  col.accessor('id', { header: 'Alert', cell: (c) => <span className="font-bold">{c.getValue()}</span> }),
  col.accessor('lines', {
    header: 'Lines',
    enableSorting: false,
    cell: (c) => (
      <span className="flex items-center gap-1">
        {c
          .getValue()
          .split(' ')
          .map((r) => (
            <RouteBullet key={r} route={r} size="sm" />
          ))}
      </span>
    ),
  }),
  col.accessor('station', { header: 'Station' }),
  col.accessor('kind', { header: 'Kind' }),
  col.accessor('status', {
    header: 'Status',
    cell: (c) => <ToneBadge tone={STATUS_TONE[c.getValue()]}>{c.getValue()}</ToneBadge>,
  }),
  col.accessor('riders', { header: 'Riders', cell: (c) => count(c.getValue()) }),
  col.accessor('reported', { header: 'Reported', sortFn: 'text' }),
  col.accessor('crew', { header: 'Crew' }),
]);

/** the service alerts table: five to a page, selectable, with bulk actions and rows that open */
export function AlertsTable({ data = ALERTS, loading = false }: { data?: Alert[]; loading?: boolean }) {
  const [assigned, setAssigned] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      <DataTable
        columns={ALERT_COLUMNS}
        data={data}
        getRowId={(a) => a.id}
        pageSize={5}
        filterPlaceholder="Filter alerts"
        searchShortcut
        selectable={(a) => a.status !== 'Resolved'}
        stickyFirstColumn
        columnMenus
        loading={loading}
        emptyTitle="No alerts"
        emptyDescription="Alerts appear here once the control centre posts them."
        renderExpanded={(a) => (
          <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-[auto_1fr]">
            <dt className="font-bold text-muted-foreground">Crew</dt>
            <dd>{a.crew}</dd>
            <dt className="font-bold text-muted-foreground">Riders affected</dt>
            <dd>{count(a.riders)}</dd>
          </dl>
        )}
        bulkActions={(rows, clear) => (
          <>
            <Button
              size="sm"
              onClick={() => {
                setAssigned(`Assigned ${rows.length} to D. Okafor`);
                clear();
              }}
            >
              Assign crew
            </Button>
            <Button size="sm" variant="ghost">
              Export
            </Button>
          </>
        )}
      />
      {assigned && <p className="text-sm text-muted-foreground">{assigned}</p>}
    </div>
  );
}

export type Stop = { id: string; station: string; task: string };

export const WALK: Stop[] = [
  { id: 'TW-5521', station: 'Atlantic Av–Barclays Ctr', task: 'Signal check' },
  { id: 'TW-5524', station: 'Nevins St', task: 'Third rail inspection' },
  { id: 'TW-5530', station: 'Borough Hall', task: 'Switch lubrication' },
  { id: 'TW-5533', station: 'Wall St', task: 'Platform edge survey' },
];

const stop = dataTableColumns<Stop>();
const WALK_COLUMNS = stop.columns([
  stop.accessor('id', { header: 'Walk', enableSorting: false }),
  stop.accessor('station', { header: 'Station', enableSorting: false }),
  stop.accessor('task', { header: 'Task', enableSorting: false, enableHiding: false }),
]);

/** tonight's track walk, in the order the crew will take it */
export function WalkTable() {
  const [walk, setWalk] = useState(WALK);
  return (
    <DataTable
      columns={WALK_COLUMNS}
      data={walk}
      getRowId={(s) => s.id}
      rowLabel={(s) => `${s.id}, ${s.station}`}
      filter={false}
      pageSize={false}
      onReorder={({ from, to }) => setWalk((r) => arrayMove(r, from, to))}
    />
  );
}

function DataTableDemo() {
  const [loading, setLoading] = useState(false);
  const empty = useMemo<Alert[]>(() => [], []);
  return (
    <div className="space-y-12">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight">Service alerts</h3>
          <Button size="sm" variant="outline" onClick={() => setLoading(!loading)}>
            {loading ? 'Stop loading' : 'Show loading'}
          </Button>
        </div>
        <AlertsTable loading={loading} />
      </section>
      <section className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight">Tonight’s track walk: drag to reorder</h3>
        <WalkTable />
      </section>
      <section className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight">Empty</h3>
        <DataTable
          columns={ALERT_COLUMNS}
          data={empty}
          filter={false}
          emptyTitle="No alerts"
          emptyDescription="Good service on every line."
          emptyAction={<Button size="sm">New alert</Button>}
        />
      </section>
      <section className="space-y-3">
        <h3 className="text-xl font-bold tracking-tight">A pinned header, scrolling inside</h3>
        <DataTable columns={ALERT_COLUMNS} data={ALERTS} pageSize={false} maxHeight={320} stickyFirstColumn filter={false} />
      </section>
    </div>
  );
}

// ── user menu ────────────────────────────────────────────────────────────────

const ORGS: UserMenuOrganization[] = [
  { id: 'subways', name: 'Rapid Transit Operations', role: 'admin' },
  { id: 'buses', name: 'Bus Operations', role: 'dispatcher' },
  { id: 'railway', name: 'Island Railway', role: 'crew-supervisor' },
];

function UserMenuDemo() {
  const [org, setOrg] = useState('subways');
  const [signedOut, setSignedOut] = useState(false);
  const user = { name: 'Dana Ruiz', email: 'dana.ruiz@transit.example' };
  const links = [
    { label: 'Your account', href: '#/account', icon: Settings },
    { label: 'View public site', href: '#/site', icon: Globe },
    { label: 'Help and training', href: '#/help', icon: CircleHelp },
  ];
  return (
    <div className="flex flex-col gap-8">
      <div className="flex h-16 items-center justify-end gap-3 border border-border px-4">
        <span className="mr-auto text-sm text-muted-foreground">{signedOut ? 'Signed out' : 'Top bar'}</span>
        <UserMenu
          user={user}
          organizations={ORGS}
          activeOrganizationId={org}
          onSwitchOrganization={setOrg}
          links={links}
          onSignOut={() => setSignedOut(true)}
        />
      </div>
      <div className="flex gap-6">
        <div className="on-sign flex h-80 w-60 flex-col justify-end bg-sign">
          <UserMenu
            variant="sidebar"
            user={user}
            organizations={ORGS}
            activeOrganizationId={org}
            onSwitchOrganization={setOrg}
            links={links}
            onSignOut={() => setSignedOut(true)}
          />
        </div>
        <div className="on-sign flex h-80 w-16 flex-col justify-end bg-sign">
          <UserMenu
            variant="sidebar"
            collapsed
            user={user}
            organizations={ORGS.slice(0, 1)}
            activeOrganizationId="subways"
            links={links}
            onSignOut={() => setSignedOut(true)}
          />
        </div>
      </div>
    </div>
  );
}

// ── week calendar ────────────────────────────────────────────────────────────

/** this week's crew jobs, around today */
export function crewWeek(now = new Date()): WeekCalendarEvent[] {
  const monday = weekStartOf(now);
  const at = (day: number, h: number, m = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day, h, m);
  return [
    {
      id: 'j1',
      title: 'Signal test',
      subtitle: 'A C · Jay St–MetroTech',
      meta: 'Sam Okafor',
      start: at(0, 8),
      end: at(0, 9),
      tone: 'ok',
      label: 'passed',
      done: true,
    },
    {
      id: 'j2',
      title: 'Switch repair',
      subtitle: 'J Z · Marcy Av',
      meta: 'Priya Nair',
      start: at(0, 10, 30),
      end: at(0, 11, 30),
      tone: 'destructive',
      label: 'failed',
      done: true,
    },
    {
      id: 'j3',
      title: 'Track walk',
      subtitle: 'G · Hoyt–Schermerhorn',
      meta: 'Sam Okafor',
      start: at(1, 9),
      end: at(1, 10, 30),
      line: 'lime',
      label: 'booked',
    },
    {
      id: 'j4',
      title: 'Fire alarm test',
      subtitle: '4 5 6 · Grand Central',
      meta: 'Lee Chen',
      start: at(1, 9, 30),
      end: at(1, 11),
      line: 'green',
      label: 'booked',
    },
    {
      id: 'j5',
      title: 'Third rail heater',
      subtitle: 'N Q R W · Canal St',
      meta: 'Priya Nair',
      start: at(2, 13),
      end: at(2, 14),
      status: { name: 'Awaiting parts', color: 'amber' },
    },
    {
      id: 'j6',
      title: 'Platform survey',
      subtitle: '7 · Hunters Point Av',
      meta: 'Jordan Wells',
      start: at(3, 8, 30),
      end: at(3, 9, 15),
      status: { name: 'In review', color: 'blue' },
    },
    {
      id: 'j7',
      title: 'Escalator overhaul',
      subtitle: 'L · Bedford Av',
      meta: 'Sam Okafor',
      start: at(4, 15),
      end: at(4, 16),
      tone: 'neutral',
      label: 'booked',
    },
    {
      id: 'j8',
      title: 'Train wash',
      subtitle: 'E · Jamaica Yard',
      meta: 'Lee Chen',
      start: at(4, 11),
      end: at(4, 12),
      tone: 'ok',
      label: 'passed',
      done: true,
    },
  ];
}

function WeekCalendarDemo() {
  const [layout, setLayout] = useState<'auto' | 'grid' | 'list'>('auto');
  const [opened, setOpened] = useState<string | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <WeekCalendar
        events={crewWeek()}
        layout={layout}
        onEventClick={(e) => setOpened(`${e.title} · ${e.subtitle ?? ''}`)}
        toolbar={
          <ToggleGroup value={[layout]} onValueChange={(v: string[]) => v[0] && setLayout(v[0] as typeof layout)} aria-label="Layout">
            <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
            <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
            <ToggleGroupItem value="list">List</ToggleGroupItem>
          </ToggleGroup>
        }
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {opened ? `Opened: ${opened}` : 'Click a job to open it.'}
      </p>
    </div>
  );
}

export const BLOCKS_DEMOS: Record<string, () => ReactNode> = {
  'app-shell': () => <AppShellDemo />,
  'data-table': () => <DataTableDemo />,
  'user-menu': () => <UserMenuDemo />,
  'week-calendar': () => <WeekCalendarDemo />,
};
