import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Box, Home } from 'lucide-react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell, isNavItemActive } from '@/components/blocks/app-shell';
import { DataTable, dataTableColumns } from '@/components/blocks/data-table';
import { UserMenu } from '@/components/blocks/user-menu';
import { layoutDay, statusTone, WeekCalendar, weekStartOf, type WeekCalendarEvent } from '@/components/blocks/week-calendar';
import { AlertsTable, BLOCKS_DEMOS, staffNav, WalkTable } from '@/docs/demos/blocks';

// jsdom lacks a few things Base UI reaches for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.getAnimations ??= () => [];

afterEach(() => {
  vi.useRealTimers();
});

// Thursday 5 November 2026, 10am local
const NOW = new Date(2026, 10, 5, 10, 0);
const at = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m);
// Intl puts thin spaces around the dash in a date range
const week = (label: string) => (name: string) => name.replace(/\s/g, ' ') === label;

// ── app shell ────────────────────────────────────────────────────────────────

const shell = (props: Partial<Parameters<typeof AppShell>[0]> = {}) => (
  <AppShell
    brand={{ name: 'Headway' }}
    sections={[
      {
        title: 'Casework',
        items: [
          { href: '#/home', label: 'Home', icon: Home, exact: true },
          { href: '#/box', label: 'Box', icon: Box, badge: 7 },
        ],
      },
    ]}
    activeHref="#/box"
    {...props}
  >
    <p>content</p>
  </AppShell>
);

describe('AppShell', () => {
  beforeEach(() => window.localStorage.clear());

  it('collapses to an icon rail and remembers it', async () => {
    const { unmount } = render(shell());
    await userEvent.click(screen.getByRole('button', { name: 'Collapse the sidebar' }));
    expect(screen.getByRole('button', { name: 'Expand the sidebar' })).toBeInTheDocument();
    expect(window.localStorage.getItem('headway.sidebar.collapsed')).toBe('1');
    unmount();

    render(shell());
    expect(await screen.findByRole('button', { name: 'Expand the sidebar' })).toBeInTheDocument();
  });

  it('on the rail, names each icon for screen readers and in a tooltip on hover', async () => {
    window.localStorage.setItem('headway.sidebar.collapsed', '1');
    render(shell());
    await screen.findByRole('button', { name: 'Expand the sidebar' });
    const [home] = screen.getAllByRole('link', { name: 'Home' });
    expect(home).not.toHaveAttribute('title');
    await userEvent.hover(home!);
    expect(await screen.findByText('Home', { selector: '[data-slot=tooltip-content]' })).toBeInTheDocument();
  });

  it('marks the active link with aria-current and the white bar, including on pages under it', () => {
    render(shell({ activeHref: '#/box/42' }));
    const box = screen.getByRole('link', { name: /Box/ });
    const home = screen.getByRole('link', { name: 'Home' });
    expect(box).toHaveAttribute('aria-current', 'page');
    expect(box.className).toContain('border-primary');
    expect(home).not.toHaveAttribute('aria-current');
    expect(home.className).not.toContain('border-primary');
  });

  it('matches exact items only on their own href', () => {
    expect(isNavItemActive({ href: '#/home', exact: true }, '#/home/x')).toBe(false);
    expect(isNavItemActive({ href: '#/home' }, '#/home/x')).toBe(true);
    expect(isNavItemActive({ href: '#/home' }, '#/homes')).toBe(false);
  });

  it('shows badge counts, capped at 99+', () => {
    render(shell({ sections: staffNav({ admin: true, crews: true }), activeHref: '#/' }));
    expect(screen.getByRole('link', { name: 'Incidents, 3 open' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Track walks, 99+' })).toBeInTheDocument();
  });

  it('leaves out hidden items, and sections with nothing left', () => {
    render(shell({ sections: staffNav({ admin: false, crews: false }), activeHref: '#/' }));
    expect(screen.queryByRole('link', { name: /Track walks/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Audit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Setup' })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Insight' })).toBeInTheDocument();
  });

  it('keeps the brand mounted across re-renders', () => {
    const { rerender } = render(shell());
    const brand = screen.getByRole('link', { name: 'Headway' });
    rerender(shell({ topBar: <span>search</span> }));
    expect(screen.getByRole('link', { name: 'Headway' })).toBe(brand);
  });

  it('renders links through renderLink', () => {
    render(
      shell({
        renderLink: ({ href, children }) => (
          <a href={href} data-router="yes">
            {children}
          </a>
        ),
      }),
    );
    for (const link of screen.getAllByRole('link', { name: 'Home' })) expect(link).toHaveAttribute('data-router', 'yes');
  });

  it('opens the nav in a drawer from the menu button, and closes it on navigating', async () => {
    render(shell());
    await userEvent.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('dialog');
    await userEvent.click(within(drawer).getByRole('link', { name: 'Home' }));
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('names the brand link by its content, wordmark then caption, and skips to the page', async () => {
    render(shell({ brand: { name: 'Headway', caption: 'Rapid Transit Operations', routes: ['A'] } }));
    expect(screen.getByRole('link', { name: /^Headway\s*Rapid Transit Operations$/ })).not.toHaveAttribute('aria-label');
    await userEvent.tab();
    const skip = screen.getByRole('link', { name: 'Skip to content' });
    expect(skip).toHaveFocus();
    await userEvent.click(skip);
    expect(screen.getByRole('main')).toHaveFocus();
  });
});

// ── data table ───────────────────────────────────────────────────────────────

const table = () => screen.getAllByRole('table')[0]!;
const bodyRows = () => within(table()).getAllByRole('row').slice(1);
// the alert column: after the checkbox and the open/close button
const permitAt = (i: number) => within(bodyRows()[i]!).getAllByRole('cell')[2]!.textContent;

describe('DataTable', () => {
  it('pages its rows', async () => {
    render(<AlertsTable />);
    expect(bodyRows()).toHaveLength(5);
    expect(screen.getByText('10 rows · page 1 of 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('link', { name: '2' }));
    expect(screen.getByText('10 rows · page 2 of 2')).toBeInTheDocument();
    expect(permitAt(0)).toBe('SA-2026-0436');
  });

  it('sorts numbers biggest-first and text A–Z on the first click, flips on the next, and says so', async () => {
    render(<AlertsTable />);
    const riders = screen.getByRole('button', { name: 'Riders' });
    await userEvent.click(riders);
    expect(riders.closest('th')).toHaveAttribute('aria-sort', 'descending');
    expect(permitAt(0)).toBe('SA-2026-0423'); // 4,820
    await userEvent.click(riders);
    expect(riders.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(permitAt(0)).toBe('SA-2026-0452'); // 60

    const type = screen.getByRole('button', { name: 'Kind' });
    await userEvent.click(type);
    expect(type.closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(riders.closest('th')).not.toHaveAttribute('aria-sort');
    expect(permitAt(0)).toBe('SA-2026-0431'); // Electrical problem
  });

  it('filters across columns and recounts, with an empty state that clears the filter', async () => {
    render(<AlertsTable />);
    const box = screen.getByRole('textbox', { name: 'Filter alerts' });
    await userEvent.type(box, 'okafor');
    expect(bodyRows().map((_, i) => permitAt(i))).toEqual(['SA-2026-0418', 'SA-2026-0423', 'SA-2026-0452']);
    expect(screen.getByText('3 rows')).toBeInTheDocument();
    await userEvent.clear(box);
    await userEvent.type(box, 'zzz');
    expect(screen.getByText('Nothing matches.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear the filter' }));
    expect(screen.getByText('10 rows · page 1 of 2')).toBeInTheDocument();
  });

  it('hides a column from the Columns menu, and from its own header menu', async () => {
    render(<AlertsTable />);
    expect(screen.getByRole('columnheader', { name: /Kind/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Columns/ }));
    await userEvent.click(await screen.findByRole('menuitemcheckbox', { name: 'Kind' }));
    expect(screen.queryByRole('columnheader', { name: /Kind/ })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByRole('button', { name: 'Crew column options' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Hide column' }));
    expect(screen.queryByRole('columnheader', { name: /Crew/ })).not.toBeInTheDocument();
  });

  it('sorts from a header menu', async () => {
    render(<AlertsTable />);
    await userEvent.click(screen.getByRole('button', { name: 'Riders column options' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sort ascending' }));
    expect(screen.getByRole('button', { name: 'Riders' }).closest('th')).toHaveAttribute('aria-sort', 'ascending');
    expect(permitAt(0)).toBe('SA-2026-0452');
  });

  it('selects the selectable rows on the page from the header checkbox and shows the bulk-action bar', async () => {
    render(<AlertsTable />);
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    // the resolved alerts on page one (0419, 0427) can't be selected
    expect(screen.getByText(/3 of 10 selected/)).toBeInTheDocument();
    expect(bodyRows()[0]).toHaveAttribute('data-state', 'selected');
    expect(screen.getByRole('checkbox', { name: 'Select SA-2026-0419' })).toHaveAttribute('aria-disabled', 'true');
    const bar = screen.getByRole('toolbar', { name: 'Bulk actions' });
    expect(within(bar).getByText('3 selected')).toBeInTheDocument();
    await userEvent.click(within(bar).getByRole('button', { name: 'Assign crew' }));
    expect(screen.getByText('Assigned 3 to D. Okafor')).toBeInTheDocument();
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('selects a row by clicking it, and clears the selection with the clear button or Esc', async () => {
    render(<AlertsTable />);
    await userEvent.click(within(bodyRows()[0]!).getByText('Jay St–MetroTech'));
    expect(bodyRows()[0]).toHaveAttribute('data-state', 'selected');
    await userEvent.click(screen.getByRole('button', { name: /Clear selection/ }));
    expect(bodyRows()[0]).not.toHaveAttribute('data-state');

    await userEvent.click(within(bodyRows()[2]!).getByText('Hoyt–Schermerhorn'));
    expect(screen.getByRole('toolbar', { name: 'Bulk actions' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('opens a row to show more', async () => {
    render(<AlertsTable />);
    const open = screen.getByRole('button', { name: 'Expand SA-2026-0423' });
    expect(open).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(open);
    expect(screen.getByRole('button', { name: 'Collapse SA-2026-0423' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('4,820', { selector: 'dd' })).toBeInTheDocument();
    // opening a row doesn't select it
    expect(screen.queryByRole('toolbar', { name: 'Bulk actions' })).not.toBeInTheDocument();
  });

  it('calls onRowClick on a click or Enter', async () => {
    const onRowClick = vi.fn();
    const c = dataTableColumns<{ id: string }>();
    render(
      <DataTable
        columns={c.columns([c.accessor('id', { header: 'ID' })])}
        data={[{ id: 'INC-1' }, { id: 'INC-2' }]}
        getRowId={(r) => r.id}
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(screen.getByText('INC-2'));
    expect(onRowClick).toHaveBeenCalledWith({ id: 'INC-2' });
    bodyRows()[0]!.focus();
    await userEvent.keyboard('{Enter}');
    expect(onRowClick).toHaveBeenLastCalledWith({ id: 'INC-1' });
  });

  it('shows the empty state with its action, and a loading state', () => {
    const c = dataTableColumns<{ id: string }>();
    const columns = c.columns([c.accessor('id', { header: 'ID' })]);
    const { rerender } = render(
      <DataTable columns={columns} data={[]} emptyTitle="No alerts" emptyAction={<button type="button">New alert</button>} />,
    );
    expect(screen.getByText('No alerts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New alert' })).toBeInTheDocument();

    rerender(<DataTable columns={columns} data={[]} loading />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    expect(screen.queryByText('No alerts')).not.toBeInTheDocument();

    rerender(<DataTable columns={columns} data={[{ id: 'a' }]} loading />);
    expect(table()).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('pins the header and the first column when asked', () => {
    render(<AlertsTable />);
    // the checkbox and open/close columns, then Alert, stick to the left
    const header = within(table()).getAllByRole('columnheader');
    expect(header[0]).toHaveStyle({ position: 'sticky', left: '0px' });
    expect(header[2]).toHaveStyle({ position: 'sticky', left: '88px' });
    expect(header[3]).not.toHaveStyle({ position: 'sticky' });

    const c = dataTableColumns<{ id: string }>();
    render(<DataTable columns={c.columns([c.accessor('id', { header: 'ID' })])} data={[{ id: 'a' }]} maxHeight={200} />);
    const last = screen.getAllByRole('table').at(-1)!;
    expect(within(last).getByRole('columnheader', { name: 'ID' })).toHaveStyle({ position: 'sticky', top: '0px' });
  });

  it('reorders rows from the keyboard', async () => {
    // jsdom lays nothing out; give each row a place so dnd-kit can find its neighbours
    const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      const tr = this.closest('tr');
      const index = tr ? [...(tr.parentElement?.children ?? [])].indexOf(tr) : 0;
      const top = index * 40;
      return { x: 0, y: top, top, left: 0, bottom: top + 40, right: 600, width: 600, height: 40, toJSON: () => ({}) } as DOMRect;
    });
    try {
      render(<WalkTable />);
      const ids = () => bodyRows().map((r) => within(r).getAllByRole('cell')[1]!.textContent);
      expect(ids()).toEqual(['TW-5521', 'TW-5524', 'TW-5530', 'TW-5533']);
      const handle = screen.getByRole('button', { name: 'Reorder TW-5521, Atlantic Av–Barclays Ctr' });
      handle.focus();
      const tick = () => act(() => new Promise((r) => setTimeout(r, 20)));
      fireEvent.keyDown(handle, { code: 'Space', key: ' ' });
      await tick();
      fireEvent.keyDown(document, { code: 'ArrowDown', key: 'ArrowDown' });
      await tick();
      fireEvent.keyDown(document, { code: 'Space', key: ' ' });
      await tick();
      await vi.waitFor(() => expect(ids()).toEqual(['TW-5524', 'TW-5521', 'TW-5530', 'TW-5533']));
    } finally {
      rect.mockRestore();
    }
  });
});

// ── user menu ────────────────────────────────────────────────────────────────

describe('UserMenu', () => {
  const orgs = [
    { id: 'subways', name: 'Rapid Transit Operations', role: 'admin' },
    { id: 'buses', name: 'Bus Operations', role: 'crew-supervisor' },
  ];

  it('shows who and where, switches organization and signs out', async () => {
    const onSwitch = vi.fn();
    const onSignOut = vi.fn();
    render(
      <UserMenu
        user={{ name: 'Dana Ruiz', email: 'dana@transit.example' }}
        organizations={orgs}
        activeOrganizationId="subways"
        onSwitchOrganization={onSwitch}
        links={[{ label: 'Your account', href: '/account' }]}
        onSignOut={onSignOut}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Dana Ruiz' }));
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByText('dana@transit.example')).toBeInTheDocument();
    expect(within(menu).getByRole('menuitemradio', { name: /Rapid Transit Operations/ })).toHaveAttribute('aria-checked', 'true');
    expect(within(menu).getByText('Crew supervisor')).toBeInTheDocument();
    expect(within(menu).getByRole('menuitem', { name: 'Your account' })).toHaveAttribute('href', '/account');

    await userEvent.click(within(menu).getByRole('menuitemradio', { name: /Bus Operations/ }));
    expect(onSwitch).toHaveBeenCalledWith('buses');
    // let the menu finish closing first: under load its exit can still be
    // running, and a click would land in the closing menu instead of a new one
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Dana Ruiz' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('with one organization, names it rather than offering to switch; collapsed, is just the avatar', async () => {
    render(
      <UserMenu variant="sidebar" collapsed user={{ name: 'Dana Ruiz' }} organizations={orgs.slice(0, 1)} activeOrganizationId="subways" />,
    );
    const trigger = screen.getByRole('button', { name: 'Dana Ruiz' });
    expect(trigger).toHaveTextContent('DR');
    await userEvent.click(trigger);
    const menu = await screen.findByRole('menu');
    expect(within(menu).queryByRole('menuitemradio')).not.toBeInTheDocument();
    expect(within(menu).getByText('Rapid Transit Operations · Admin')).toBeInTheDocument();
  });
});

// ── week calendar ────────────────────────────────────────────────────────────

const EVENTS: WeekCalendarEvent[] = [
  { id: 'a', title: 'Signal test', subtitle: 'A C · Jay St', start: at(2, 8), end: at(2, 9), tone: 'ok', label: 'passed', done: true },
  { id: 'b', title: 'Track walk', subtitle: 'G · Hoyt St', start: at(5, 9), end: at(5, 10, 30), label: 'booked' },
  { id: 'c', title: 'Fire alarm test', line: 'green', start: at(5, 9, 30), end: at(5, 11), status: { name: 'In review', color: 'blue' } },
  { id: 'd', title: 'Next week', start: at(10, 9) },
];

describe('WeekCalendar', () => {
  it('starts weeks on Monday and lays overlapping events side by side', () => {
    expect(weekStartOf(NOW)).toEqual(new Date(2026, 10, 2));
    expect(weekStartOf(new Date(2026, 10, 8, 23))).toEqual(new Date(2026, 10, 2));
    const placed = layoutDay(EVENTS.slice(1, 3));
    expect(placed.map((p) => [p.event.id, p.lane, p.lanes])).toEqual([
      ['b', 0, 2],
      ['c', 1, 2],
    ]);
    expect(layoutDay([EVENTS[0]!])[0]).toMatchObject({ lane: 0, lanes: 1 });
  });

  it('places events by day and time in the grid, marks today and opens an event', async () => {
    const onEventClick = vi.fn();
    render(
      <WeekCalendar events={EVENTS} now={NOW} layout="grid" locale="en-US" onEventClick={onEventClick} hourHeight={60} startHour={7} />,
    );
    expect(screen.getByRole('heading', { name: week('Nov 2 – 8, 2026') })).toBeInTheDocument();
    const thursday = screen.getByRole('group', { name: 'Thursday, November 5, today' });
    const walk = within(thursday).getByRole('button', { name: /Track walk/ });
    // 9am with the grid starting at 7am, 60px an hour
    expect(walk.style.top).toBe('121px');
    expect(within(thursday).getByRole('button', { name: /Fire alarm.*In review/ })).toHaveAttribute('data-tone', 'info');
    expect(screen.queryByText(/Next week/)).not.toBeInTheDocument();
    const monday = screen.getByRole('group', { name: 'Monday, November 2' });
    expect(within(monday).getByRole('button', { name: /Signal test.*passed, done/ })).toHaveAttribute('data-tone', 'ok');
    await userEvent.click(walk);
    expect(onEventClick).toHaveBeenCalledWith(EVENTS[1]);
  });

  it('moves a week at a time and back to this week', async () => {
    function Controlled() {
      const [week, setWeek] = useState(new Date(2026, 10, 2));
      return <WeekCalendar events={EVENTS} now={NOW} layout="list" locale="en-US" weekStart={week} onWeekChange={setWeek} />;
    }
    render(<Controlled />);
    const thisWeek = screen.getByRole('button', { name: 'This week' });
    expect(thisWeek).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next week' }));
    expect(screen.getByRole('heading', { name: week('Nov 9 – 15, 2026') })).toBeInTheDocument();
    expect(screen.getByText('Next week')).toBeInTheDocument();
    expect(thisWeek).toBeEnabled();
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous week' }));
    expect(screen.getByRole('heading', { name: week('Oct 26 – Nov 1, 2026') })).toBeInTheDocument();
    await userEvent.click(thisWeek);
    await waitFor(() => expect(screen.getByRole('heading', { name: week('Nov 2 – 8, 2026') })).toBeInTheDocument());
  });

  it('lists the week by day on narrow screens, with today marked and empty days said', () => {
    render(<WeekCalendar events={EVENTS} now={NOW} layout="list" locale="en-US" />);
    const today = screen.getByRole('listitem', { name: /Thursday, November 5/ });
    expect(today).toHaveAttribute('data-today');
    expect(within(today).getByText('Today')).toBeInTheDocument();
    expect(within(today).getByText('In review')).toBeInTheDocument();
    expect(within(today).getByText('booked')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: /Tuesday, November 3/ })).getByText('Nothing booked')).toBeInTheDocument();
    expect(within(screen.getByRole('listitem', { name: /Monday, November 2/ })).getByLabelText('Done')).toBeInTheDocument();
  });
  it('maps org status colours onto tones and colours the edge by route line', () => {
    expect(statusTone('Amber')).toBe('warning');
    expect(statusTone('blue')).toBe('info');
    expect(statusTone('mauve')).toBe('muted');
    render(<WeekCalendar events={EVENTS} now={NOW} layout="grid" locale="en-US" />);
    const fire = screen.getByText(/Fire alarm test/, { selector: '.sr-only' }).closest('[data-slot=week-calendar-event]')!;
    expect(fire).toHaveAttribute('data-line', 'green');
    expect(fire.className).toContain('border-l-line-green');
  });
});

// ── demos ────────────────────────────────────────────────────────────────────

describe('BLOCKS_DEMOS', () => {
  it('renders every demo', () => {
    for (const [name, Demo] of Object.entries(BLOCKS_DEMOS)) {
      const { unmount } = render(<Demo />);
      expect(document.body.textContent, name).not.toBe('');
      unmount();
    }
  });
});
