// Made-up data for the sample app: a subway's lines, stations, alerts and
// planned work. Fixed (no randomness) so every load and every test sees the
// same thing; times are relative to now so the console always looks live.
import type { Tone } from '@/components/ui/tone-badge';

export type ServiceStatus = 'good' | 'delays' | 'planned' | 'part-suspended' | 'suspended';

export const STATUS: Record<ServiceStatus, { label: string; tone: Tone }> = {
  good: { label: 'Good service', tone: 'ok' },
  delays: { label: 'Delays', tone: 'warning' },
  planned: { label: 'Planned work', tone: 'info' },
  'part-suspended': { label: 'Part suspended', tone: 'destructive' },
  suspended: { label: 'Suspended', tone: 'destructive' },
};

export type Route = {
  id: string;
  name: string;
  trunk: string;
  express?: boolean;
  status: ServiceStatus;
  note?: string;
  /** trains in service right now / scheduled */
  trains: [number, number];
  /** minutes between trains at peak */
  headway: number;
  terminals: [string, string];
  stations: string[];
  /** index into stations of the train we follow on the line page */
  trainAt: number;
};

const EIGHTH_AV = [
  'Inwood–207 St',
  'Dyckman St',
  '190 St',
  '175 St',
  '168 St',
  '145 St',
  '125 St',
  '59 St–Columbus Circle',
  '42 St–Port Authority',
  '34 St–Penn Station',
  '14 St',
  'W 4 St–Washington Sq',
  'Canal St',
  'Chambers St',
  'Fulton St',
  'Jay St–MetroTech',
  'Hoyt–Schermerhorn Sts',
  'Nostrand Av',
  'Utica Av',
  'Euclid Av',
];
const SIXTH_AV = [
  'Jamaica–179 St',
  'Parsons Blvd',
  'Forest Hills–71 Av',
  'Jackson Hts–Roosevelt Av',
  'Queensboro Plaza',
  '21 St–Queensbridge',
  'Lexington Av–63 St',
  '57 St',
  '47–50 Sts–Rockefeller Ctr',
  '42 St–Bryant Pk',
  '34 St–Herald Sq',
  '14 St',
  'W 4 St–Washington Sq',
  'Broadway–Lafayette St',
  'Delancey St–Essex St',
  'York St',
  'Jay St–MetroTech',
  'Bergen St',
  '7 Av',
  'Church Av',
  'Coney Island–Stillwell Av',
];
const LEX = [
  'Pelham Bay Park',
  'Parkchester',
  'Hunts Point Av',
  '125 St',
  '86 St',
  '59 St',
  'Grand Central–42 St',
  '14 St–Union Sq',
  'Brooklyn Bridge–City Hall',
  'Fulton St',
  'Bowling Green',
  'Borough Hall',
  'Atlantic Av–Barclays Ctr',
  'Crown Hts–Utica Av',
];
const CROSSTOWN = [
  'Court Sq',
  '21 St',
  'Greenpoint Av',
  'Nassau Av',
  'Metropolitan Av',
  'Bedford–Nostrand Avs',
  'Hoyt–Schermerhorn Sts',
  'Bergen St',
  'Church Av',
];
const CANARSIE = [
  '8 Av',
  '6 Av',
  'Union Sq',
  '1 Av',
  'Bedford Av',
  'Lorimer St',
  'Myrtle–Wyckoff Avs',
  'Broadway Junction',
  'Canarsie–Rockaway Pkwy',
];
const FLUSHING = [
  'Flushing–Main St',
  'Mets–Willets Point',
  'Junction Blvd',
  '74 St–Broadway',
  '61 St–Woodside',
  'Queensboro Plaza',
  'Court Sq',
  'Grand Central–42 St',
  'Times Sq–42 St',
  '34 St–Hudson Yards',
];
const BROADWAY = [
  'Astoria–Ditmars Blvd',
  'Queensboro Plaza',
  'Lexington Av/59 St',
  'Times Sq–42 St',
  '34 St–Herald Sq',
  '14 St–Union Sq',
  'Canal St',
  'Atlantic Av–Barclays Ctr',
  'DeKalb Av',
  'Coney Island–Stillwell Av',
];

const term = (s: string[]): [string, string] => [s[0]!, s.at(-1)!];

export const ROUTES: Route[] = [
  {
    id: 'A',
    name: '8 Av Express',
    trunk: '8 Av',
    express: true,
    status: 'delays',
    note: 'Signal problem at Hoyt–Schermerhorn Sts',
    trains: [41, 46],
    headway: 6,
    terminals: term(EIGHTH_AV),
    stations: EIGHTH_AV,
    trainAt: 15,
  },
  {
    id: 'C',
    name: '8 Av Local',
    trunk: '8 Av',
    status: 'delays',
    note: 'Rerouted via the F between Jay St and Church Av',
    trains: [24, 28],
    headway: 8,
    terminals: term(EIGHTH_AV),
    stations: EIGHTH_AV,
    trainAt: 12,
  },
  {
    id: 'E',
    name: '8 Av Local',
    trunk: '8 Av',
    status: 'good',
    trains: [30, 30],
    headway: 5,
    terminals: ['Jamaica Center', 'World Trade Center'],
    stations: EIGHTH_AV.slice(7, 14),
    trainAt: 3,
  },
  {
    id: 'B',
    name: '6 Av Express',
    trunk: '6 Av',
    express: true,
    status: 'good',
    trains: [22, 22],
    headway: 9,
    terminals: ['Bedford Park Blvd', 'Brighton Beach'],
    stations: SIXTH_AV.slice(8, 20),
    trainAt: 4,
  },
  {
    id: 'D',
    name: '6 Av Express',
    trunk: '6 Av',
    express: true,
    status: 'good',
    trains: [33, 34],
    headway: 7,
    terminals: ['Norwood–205 St', 'Coney Island'],
    stations: SIXTH_AV.slice(8),
    trainAt: 6,
  },
  {
    id: 'F',
    name: 'Queens Blvd Express / 6 Av Local',
    trunk: '6 Av',
    status: 'delays',
    note: 'Trains skip Bergen St in both directions',
    trains: [38, 42],
    headway: 6,
    terminals: term(SIXTH_AV),
    stations: SIXTH_AV,
    trainAt: 16,
  },
  {
    id: 'M',
    name: 'Queens Blvd / 6 Av Local',
    trunk: '6 Av',
    status: 'planned',
    note: 'No weekend trains between Essex St and Myrtle Av',
    trains: [18, 18],
    headway: 10,
    terminals: ['Forest Hills–71 Av', 'Middle Village'],
    stations: SIXTH_AV.slice(2, 15),
    trainAt: 7,
  },
  {
    id: '4',
    name: 'Lexington Av Express',
    trunk: 'Lexington Av',
    express: true,
    status: 'good',
    trains: [36, 37],
    headway: 5,
    terminals: ['Woodlawn', 'Crown Hts–Utica Av'],
    stations: LEX.slice(3),
    trainAt: 5,
  },
  {
    id: '5',
    name: 'Lexington Av Express',
    trunk: 'Lexington Av',
    express: true,
    status: 'good',
    trains: [34, 35],
    headway: 6,
    terminals: ['Eastchester–Dyre Av', 'Flatbush Av'],
    stations: LEX.slice(3),
    trainAt: 8,
  },
  {
    id: '6',
    name: 'Lexington Av Local',
    trunk: 'Lexington Av',
    status: 'good',
    trains: [40, 40],
    headway: 4,
    terminals: ['Pelham Bay Park', 'Brooklyn Bridge'],
    stations: LEX.slice(0, 9),
    trainAt: 2,
  },
  {
    id: 'G',
    name: 'Brooklyn–Queens Crosstown',
    trunk: 'Crosstown',
    status: 'part-suspended',
    note: 'No trains between Court Sq and Nassau Av; take the shuttle bus',
    trains: [9, 14],
    headway: 10,
    terminals: term(CROSSTOWN),
    stations: CROSSTOWN,
    trainAt: 5,
  },
  {
    id: 'L',
    name: '14 St–Canarsie Local',
    trunk: 'Canarsie',
    status: 'good',
    trains: [26, 26],
    headway: 4,
    terminals: term(CANARSIE),
    stations: CANARSIE,
    trainAt: 4,
  },
  {
    id: '7',
    name: 'Flushing Local',
    trunk: 'Flushing',
    status: 'good',
    trains: [44, 44],
    headway: 3,
    terminals: term(FLUSHING),
    stations: FLUSHING,
    trainAt: 6,
  },
  {
    id: 'N',
    name: 'Broadway Express',
    trunk: 'Broadway',
    status: 'planned',
    note: 'Runs local in Manhattan this weekend',
    trains: [27, 27],
    headway: 8,
    terminals: term(BROADWAY),
    stations: BROADWAY,
    trainAt: 3,
  },
  {
    id: 'Q',
    name: 'Broadway Express',
    trunk: 'Broadway',
    status: 'good',
    trains: [25, 25],
    headway: 8,
    terminals: ['96 St–2 Av', 'Coney Island'],
    stations: BROADWAY.slice(3),
    trainAt: 2,
  },
  {
    id: 'R',
    name: 'Broadway Local',
    trunk: 'Broadway',
    status: 'good',
    trains: [31, 32],
    headway: 7,
    terminals: ['Forest Hills–71 Av', 'Bay Ridge–95 St'],
    stations: BROADWAY.slice(2, 9),
    trainAt: 4,
  },
];

export const routeById = (id: string) => ROUTES.find((r) => r.id.toLowerCase() === id.toLowerCase());
export const TRUNKS = [...new Set(ROUTES.map((r) => r.trunk))];

// ── service alerts ───────────────────────────────────────────────────────────

export type AlertStatus = 'open' | 'monitoring' | 'resolved';
export const ALERT_STATUS: Record<AlertStatus, { label: string; tone: Tone }> = {
  open: { label: 'Open', tone: 'destructive' },
  monitoring: { label: 'Monitoring', tone: 'warning' },
  resolved: { label: 'Resolved', tone: 'ok' },
};

export type ServiceAlert = {
  id: string;
  routes: string[];
  station: string;
  kind: string;
  status: AlertStatus;
  riders: number;
  /** minutes ago it was raised */
  ago: number;
  owner: string;
};

const MIN = 60_000;
export const minutesAgo = (m: number) => new Date(Date.now() - m * MIN);

export const ALERTS: ServiceAlert[] = [
  {
    id: 'SA-0418',
    routes: ['A', 'C'],
    station: 'Hoyt–Schermerhorn Sts',
    kind: 'Signal problem',
    status: 'open',
    riders: 4820,
    ago: 38,
    owner: 'Dana Ruiz',
  },
  {
    id: 'SA-0419',
    routes: ['F'],
    station: 'Bergen St',
    kind: 'Station closure',
    status: 'open',
    riders: 1240,
    ago: 52,
    owner: 'Marcus Lee',
  },
  {
    id: 'SA-0420',
    routes: ['G'],
    station: 'Court Sq',
    kind: 'Track maintenance',
    status: 'monitoring',
    riders: 2650,
    ago: 95,
    owner: 'Priya Nair',
  },
  {
    id: 'SA-0421',
    routes: ['4', '5', '6'],
    station: 'Grand Central–42 St',
    kind: 'Sick passenger',
    status: 'resolved',
    riders: 3100,
    ago: 130,
    owner: 'Dana Ruiz',
  },
  {
    id: 'SA-0422',
    routes: ['7'],
    station: 'Queensboro Plaza',
    kind: 'Police activity',
    status: 'resolved',
    riders: 960,
    ago: 175,
    owner: 'Tom Okafor',
  },
  {
    id: 'SA-0423',
    routes: ['N', 'Q', 'R'],
    station: 'Canal St',
    kind: 'Electrical problem',
    status: 'monitoring',
    riders: 1880,
    ago: 210,
    owner: 'Marcus Lee',
  },
  {
    id: 'SA-0424',
    routes: ['L'],
    station: 'Bedford Av',
    kind: 'Train cleaning',
    status: 'resolved',
    riders: 185,
    ago: 260,
    owner: 'Priya Nair',
  },
  {
    id: 'SA-0425',
    routes: ['M'],
    station: 'Delancey St–Essex St',
    kind: 'Switch problem',
    status: 'resolved',
    riders: 720,
    ago: 320,
    owner: 'Tom Okafor',
  },
  {
    id: 'SA-0426',
    routes: ['E'],
    station: '34 St–Penn Station',
    kind: 'Door problem',
    status: 'resolved',
    riders: 410,
    ago: 390,
    owner: 'Dana Ruiz',
  },
  {
    id: 'SA-0427',
    routes: ['D', 'B'],
    station: '34 St–Herald Sq',
    kind: 'Rail condition',
    status: 'monitoring',
    riders: 1360,
    ago: 445,
    owner: 'Marcus Lee',
  },
  {
    id: 'SA-0428',
    routes: ['R'],
    station: 'DeKalb Av',
    kind: 'Sick passenger',
    status: 'resolved',
    riders: 230,
    ago: 510,
    owner: 'Priya Nair',
  },
  {
    id: 'SA-0429',
    routes: ['A'],
    station: '125 St',
    kind: 'Brakes activated',
    status: 'resolved',
    riders: 640,
    ago: 600,
    owner: 'Tom Okafor',
  },
];

// ── the line page's log ──────────────────────────────────────────────────────

export type LineEvent = {
  id: string;
  route: string;
  ago: number;
  text: string;
  tone: 'ok' | 'warning' | 'destructive' | 'info' | 'muted';
  source: 'Dispatch' | 'Automation' | 'Crew';
};
export const EVENTS: LineEvent[] = [
  { id: 'e1', route: 'A', ago: 38, text: 'Signal problem at Hoyt–Schermerhorn Sts: trains held', tone: 'destructive', source: 'Dispatch' },
  { id: 'e2', route: 'A', ago: 34, text: 'Alert sent to 4,820 riders following the A', tone: 'muted', source: 'Automation' },
  { id: 'e3', route: 'A', ago: 21, text: 'Signal maintainers on site', tone: 'info', source: 'Crew' },
  { id: 'e4', route: 'A', ago: 6, text: 'Trains moving at reduced speed through the area', tone: 'warning', source: 'Dispatch' },
  { id: 'e5', route: 'C', ago: 30, text: 'Southbound C trains rerouted via the F', tone: 'warning', source: 'Dispatch' },
  { id: 'e6', route: 'F', ago: 52, text: 'Bergen St closed for a station inspection', tone: 'destructive', source: 'Dispatch' },
  { id: 'e7', route: 'F', ago: 50, text: 'F trains skip Bergen St in both directions', tone: 'warning', source: 'Automation' },
  { id: 'e8', route: 'G', ago: 95, text: 'Track work begins between Court Sq and Nassau Av', tone: 'info', source: 'Crew' },
  { id: 'e9', route: 'G', ago: 90, text: 'Shuttle buses running every 8 minutes', tone: 'ok', source: 'Dispatch' },
];

// ── planned work, this week ──────────────────────────────────────────────────

export type PlannedWork = { id: string; route: string; title: string; where: string; day: number; start: number; hours: number };
export const PLANNED: PlannedWork[] = [
  { id: 'p1', route: 'G', title: 'Track replacement', where: 'Court Sq – Nassau Av', day: 0, start: 22, hours: 2 },
  { id: 'p2', route: 'M', title: 'Station rehab', where: 'Essex St – Myrtle Av', day: 1, start: 10, hours: 4 },
  { id: 'p3', route: 'N', title: 'Switch work', where: 'Canal St', day: 2, start: 13, hours: 3 },
  { id: 'p4', route: 'A', title: 'Signal upgrade', where: 'Jay St – Euclid Av', day: 2, start: 9, hours: 2 },
  { id: 'p5', route: 'L', title: 'Tunnel inspection', where: '1 Av – Bedford Av', day: 3, start: 11, hours: 2 },
  { id: 'p6', route: '7', title: 'Platform repair', where: 'Queensboro Plaza', day: 4, start: 14, hours: 3 },
  { id: 'p7', route: 'F', title: 'Escalator replacement', where: 'Bergen St', day: 4, start: 8, hours: 5 },
  { id: 'p8', route: '6', title: 'Track cleaning', where: '125 St – 86 St', day: 5, start: 12, hours: 4 },
];
