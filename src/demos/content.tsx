import { useRef, useState, type ReactNode } from 'react';
import { Accessibility, Bus, CreditCard, MapPinned, Ticket, TrainFront } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Markdown } from '@/components/ui/markdown';
import { PageHeader, PageSection } from '@/components/ui/page-header';
import { RouteBullet } from '@/components/ui/route-bullet';
import {
  SettingsSection,
  SettingsSectionContent,
  SettingsSectionDescription,
  SettingsSectionFooter,
  SettingsSectionHeader,
  SettingsSectionPanel,
  SettingsSectionStatus,
  SettingsSectionTitle,
} from '@/components/ui/settings-section';
import { Tile } from '@/components/ui/tile';
import { Tree, type TreeNode } from '@/components/ui/tree';
import { useHotkeys } from '@/hooks/use-hotkeys';

// Demos for the content items (written text, hierarchies, page headers,
// tiles, settings sections, keyboard shortcuts), keyed by registry item name.

// ---- markdown --------------------------------------------------------------

const NOTICE = `## Weekend service change

Between **Fulton St** and **Jay St–MetroTech**, the track work below changes service from 11:45 PM Friday to 5 AM Monday.

1. Manhattan-bound trains run **express** from Jay St–MetroTech to Fulton St.
2. Shuttle buses stop at the marked bus stops near each station.
3. ~~High St~~ is closed in both directions; use Jay St–MetroTech.

> Allow an extra 20 minutes. Step-free access at Jay St–MetroTech is unaffected.

### Fares

| Ride | Fare |
| --- | ---: |
| Subway or local bus | $2.90 |
| Express bus | $7.00 |
| Reduced fare | $1.45 |

- [x] Elevator at Jay St–MetroTech in service
- [ ] Escalator at Fulton St back in service

Plan ahead with the [trip planner](https://example.com/trip) or tap \`OMNY\` at any turnstile. <script>alert('raw HTML is dropped')</script>
`;

// ---- tree ------------------------------------------------------------------

type Entry = { route: string; what: string; at: string };

const ENTRIES: Record<string, Entry> = {
  signal: { route: 'A', what: 'Signal problem at Hoyt–Schermerhorn', at: '7:42' },
  rerouteC: { route: 'C', what: 'Southbound C trains rerouted via the F', at: '7:44' },
  skip: { route: 'F', what: 'F trains skip Bergen St', at: '7:45' },
  delayA: { route: 'A', what: 'A trains running with delays', at: '7:43' },
  crowding: { route: 'G', what: 'Extra G trains to ease crowding', at: '7:50' },
  restored: { route: 'A', what: 'Signal repaired, service resuming', at: '8:31' },
  normal: { route: 'C', what: 'C trains back on their usual route', at: '8:36' },
};

/** a node per entry; typeahead matches the description */
const node = (id: string, children?: TreeNode[]): TreeNode => ({ id, label: ENTRIES[id]!.what, children });

// the causal chain: what a disruption caused hangs under it
const CHAIN: TreeNode[] = [
  node('signal', [node('rerouteC', [node('skip')]), node('delayA'), node('crowding')]),
  node('restored', [node('normal')]),
];

function TreeDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="grid max-w-2xl gap-3">
      <Tree
        aria-label="How this morning's delays unfolded"
        items={CHAIN}
        defaultExpanded={['signal', 'rerouteC', 'restored']}
        selectionMode="single"
        selected={selected}
        onSelectedChange={setSelected}
        renderItem={(n) => {
          const e = ENTRIES[n.id]!;
          return (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <RouteBullet route={e.route} size="sm" />
              <span>{e.what}</span>
              <span className="ml-auto text-sm tabular-nums">{e.at}</span>
            </span>
          );
        }}
      />
      <p className="text-sm text-muted-foreground">
        Indented entries were caused by the event above them. Selected: {selected ? ENTRIES[selected]!.what : 'none'}
      </p>
    </div>
  );
}

// ---- page header -----------------------------------------------------------

function PageHeaderDemo() {
  const [q, setQ] = useState('');
  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow="Service changes"
        title="Planned work"
        count={128}
        subtitle="Every planned service change on the subway for the next four weekends."
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search service changes"
        actions={<Button>New notice</Button>}
      />
      <PageHeader
        titleAs="h2"
        eyebrow={
          <>
            <RouteBullet route="A" size="sm" />
            <RouteBullet route="C" size="sm" />
            <RouteBullet route="E" size="sm" />
          </>
        }
        title="8 Av local and express"
        subtitle="Inwood–207 St to Far Rockaway, Lefferts Blvd and World Trade Center."
      />
      <PageSection
        title="Elevators"
        description="Out of service at stations on this line."
        actions={
          <Button size="sm" variant="outline">
            Report an outage
          </Button>
        }
      >
        <p className="text-sm">
          <Badge variant="warning">Out</Badge> 59 St–Columbus Circle, street to mezzanine · back by 6 PM
        </p>
      </PageSection>
    </div>
  );
}

// ---- tile ------------------------------------------------------------------

function TileDemo() {
  const [selected, setSelected] = useState('trip');
  const tasks = [
    { id: 'trip', icon: <TrainFront />, title: 'Plan a trip', description: 'Subway, bus and rail, door to door', tone: 'hope' as const },
    { id: 'access', icon: <Accessibility />, title: 'Step-free routes', description: 'Elevators and ramps only', tone: 'sky' as const },
    { id: 'bus', icon: <Bus />, title: 'Bus arrivals', description: 'Live times at your stop', tone: 'field' as const },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((t) => (
        <Tile
          key={t.id}
          icon={t.icon}
          tone={t.tone}
          title={t.title}
          description={t.description}
          selected={selected === t.id}
          onClick={() => setSelected(t.id)}
        />
      ))}
      <Tile href="#fares" icon={<CreditCard />} tone="ash" title="Fares and OMNY" description="Tap to pay, caps and reduced fares" />
      <Tile icon={<Ticket />} tone="ash" title="MetroCard refills" description="No longer sold at this station" disabled />
      <Tile href="#map" icon={<MapPinned />} tone="ash" title="Subway map" description="The full system, day and late night" />
    </div>
  );
}

// ---- settings section ------------------------------------------------------

function AlertSettingsSection() {
  const [saved, setSaved] = useState({ lead: '10', quiet: '22' });
  const [lead, setLead] = useState(saved.lead);
  const [quiet, setQuiet] = useState(saved.quiet);
  const [status, setStatus] = useState('');
  const dirty = lead !== saved.lead || quiet !== saved.quiet;
  return (
    <SettingsSection>
      <SettingsSectionHeader>
        <SettingsSectionTitle>Service alerts</SettingsSectionTitle>
        <SettingsSectionDescription>
          When to tell you about delays on your saved lines. Changes apply to alerts sent from now on.
        </SettingsSectionDescription>
      </SettingsSectionHeader>
      <SettingsSectionPanel>
        <SettingsSectionContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ss-lead">Warn me before my trip (minutes)</Label>
            <Input
              id="ss-lead"
              inputMode="numeric"
              value={lead}
              onChange={(e) => {
                setLead(e.target.value);
                setStatus('');
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="ss-quiet">Quiet after (hour, 0–23)</Label>
            <Input
              id="ss-quiet"
              inputMode="numeric"
              value={quiet}
              onChange={(e) => {
                setQuiet(e.target.value);
                setStatus('');
              }}
            />
          </div>
        </SettingsSectionContent>
        <SettingsSectionFooter>
          <SettingsSectionStatus>{dirty ? 'Unsaved changes' : status}</SettingsSectionStatus>
          <Button
            variant="outline"
            disabled={!dirty}
            onClick={() => {
              setLead(saved.lead);
              setQuiet(saved.quiet);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!dirty}
            onClick={() => {
              setSaved({ lead, quiet });
              setStatus('Saved');
            }}
          >
            Save
          </Button>
        </SettingsSectionFooter>
      </SettingsSectionPanel>
    </SettingsSection>
  );
}

function SettingsSectionDemo() {
  return (
    <div className="flex flex-col gap-12">
      <AlertSettingsSection />
      <SettingsSection variant="destructive">
        <SettingsSectionHeader>
          <SettingsSectionTitle>Delete saved trips</SettingsSectionTitle>
          <SettingsSectionDescription>
            Removes every saved trip and the alerts that go with them. Your OMNY account and fare history are kept.
          </SettingsSectionDescription>
        </SettingsSectionHeader>
        <SettingsSectionPanel>
          <SettingsSectionContent>
            <p>You have 6 saved trips. 2 have alerts switched on.</p>
          </SettingsSectionContent>
          <SettingsSectionFooter>
            <Button variant="destructive">Delete 6 trips</Button>
          </SettingsSectionFooter>
        </SettingsSectionPanel>
      </SettingsSection>
    </div>
  );
}

// ---- use-hotkeys -----------------------------------------------------------

const ARRIVALS = [
  { route: 'Q', to: 'Coney Island–Stillwell Av', min: 2 },
  { route: 'N', to: 'Coney Island–Stillwell Av', min: 5 },
  { route: 'R', to: 'Bay Ridge–95 St', min: 7 },
  { route: 'W', to: 'Whitehall St', min: 11 },
];

function UseHotkeysDemo() {
  const [last, setLast] = useState('Nothing saved yet');
  const [index, setIndex] = useState(0);
  const search = useRef<HTMLInputElement>(null);
  useHotkeys({
    j: () => setIndex((i) => Math.min(i + 1, ARRIVALS.length - 1)),
    k: () => setIndex((i) => Math.max(i - 1, 0)),
    s: () => setLast(`Saved the ${ARRIVALS[index]!.route} to ${ARRIVALS[index]!.to}`),
    '/': () => search.current?.focus(),
  });
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Input ref={search} placeholder="Search stations (press /)" aria-label="Search stations" />
      <ul aria-label="Next trains at Times Sq–42 St" className="on-sign flex flex-col border border-border bg-card">
        {ARRIVALS.map((a, i) => (
          <li
            key={a.route}
            aria-current={i === index ? 'true' : undefined}
            className={
              i === index
                ? 'flex items-center gap-3 bg-primary px-4 py-2 font-bold text-primary-foreground'
                : 'flex items-center gap-3 px-4 py-2'
            }
          >
            <RouteBullet route={a.route} size="sm" />
            <span className="flex-1">{a.to}</span>
            <span className="tabular-nums">{a.min} min</span>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        {last}
      </p>
      <ul aria-label="Keyboard shortcuts" className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <Kbd>J</Kbd>
          <Kbd>K</Kbd> move
        </li>
        <li className="flex items-center gap-1.5">
          <Kbd>S</Kbd> save trip
        </li>
        <li className="flex items-center gap-1.5">
          <Kbd>/</Kbd> search
        </li>
      </ul>
    </div>
  );
}

export const CONTENT_DEMOS: Record<string, () => ReactNode> = {
  markdown: () => <Markdown className="max-w-2xl">{NOTICE}</Markdown>,
  tree: TreeDemo,
  'page-header': PageHeaderDemo,
  tile: TileDemo,
  'settings-section': SettingsSectionDemo,
  'use-hotkeys': UseHotkeysDemo,
};
