import { useEffect, useState, type ReactNode } from 'react';
import {
  BookOpen,
  CalendarClock,
  Construction,
  FileBarChart,
  Gauge,
  Megaphone,
  Siren,
  TrainFront,
  TriangleAlert,
  Users,
} from 'lucide-react';

import { AppShell, type NavSection } from '@/components/blocks/app-shell';
import { UserMenu } from '@/components/blocks/user-menu';
import { Toaster } from '@/components/ui/sonner';

import { ALERTS, ROUTES } from './data';
import { AlertsPage, LinePage, NotInSample, PlannedPage, StatusPage } from './pages';

// A sample operations console built from the registry: Headway's app-shell
// block (the black sign column), service status for every line, a line's
// strip map and log, the service-alert table with a new-alert form, and the
// week's planned work. Open it with ?example=app; pages are hash routes.

const NAV: NavSection[] = [
  {
    title: 'Service',
    items: [
      {
        href: '#/',
        label: 'Service status',
        icon: Gauge,
        exact: true,
        badge: ROUTES.filter((r) => r.status !== 'good').length,
        badgeLabel: 'lines need attention',
      },
      {
        href: '#/alerts',
        label: 'Service alerts',
        icon: TriangleAlert,
        badge: ALERTS.filter((a) => a.status === 'open').length,
        badgeLabel: 'open',
      },
      { href: '#/lines', label: 'Lines', icon: TrainFront },
      { href: '#/planned', label: 'Planned work', icon: Construction },
      { href: '#/incidents', label: 'Incidents', icon: Siren },
      { href: '#/notices', label: 'Customer notices', icon: Megaphone },
    ],
  },
  {
    title: 'Crews',
    items: [
      { href: '#/schedule', label: 'Crew schedule', icon: CalendarClock },
      { href: '#/people', label: 'People', icon: Users },
    ],
  },
  { title: 'Insight', items: [{ href: '#/reports', label: 'Reports', icon: FileBarChart }] },
];
const FOOTER = [{ href: '#/docs', label: 'Feed docs', icon: BookOpen }];

const pathFromHash = () => location.hash.replace(/^#/, '') || '/';

function usePath() {
  const [path, setPath] = useState(pathFromHash);
  useEffect(() => {
    const onChange = () => {
      setPath(pathFromHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return path;
}

function page(path: string): ReactNode {
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return <StatusPage />;
  if (parts[0] === 'alerts') return <AlertsPage />;
  if (parts[0] === 'planned') return <PlannedPage />;
  if (parts[0] === 'lines' && parts[1]) return <LinePage id={parts[1]} />;
  // the lines list is the status page's own list
  if (parts[0] === 'lines') return <StatusPage />;
  const item = [...NAV.flatMap((s) => s.items), ...FOOTER].find((i) => i.href === `#${path}`);
  return <NotInSample title={item?.label ?? 'Not found'} />;
}

// the top bar: a live clock, as on a station's departure board
function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15_000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <span className="ml-auto flex items-center gap-3 text-sm">
      <span className="flex items-center gap-1.5 font-bold">
        <span aria-hidden className="size-2 rounded-full bg-ok" /> Live
      </span>
      <time dateTime={now.toISOString()} className="font-bold tabular-nums">
        {now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </time>
    </span>
  );
}

export function ExampleApp() {
  const path = usePath();
  // a line page lights up "Lines" in the nav
  const activeHref = path.startsWith('/lines/') ? '#/lines' : `#${path}`;
  return (
    <>
      <AppShell
        brand={{ href: '#/', name: 'Headway', caption: 'Rapid Transit Operations', routes: ['A', 'C', 'E'] }}
        sections={NAV}
        footer={FOOTER}
        activeHref={activeHref}
        storageKey="headway.example.sidebar.collapsed"
        topBar={<Clock />}
        sidebarFooter={(collapsed) => (
          <UserMenu
            variant="sidebar"
            collapsed={collapsed}
            user={{ name: 'Dana Ruiz', email: 'dana.ruiz@transit.example' }}
            organizations={[{ id: 'rto', name: 'Rapid Transit Operations', role: 'dispatcher' }]}
            activeOrganizationId="rto"
            onSignOut={() => {}}
          />
        )}
      >
        {page(path)}
      </AppShell>
      <Toaster />
    </>
  );
}
