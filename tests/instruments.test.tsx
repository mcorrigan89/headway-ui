import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Deadline, daysBetween, formatDeadline } from '@/components/ui/deadline';
import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from '@/components/ui/description-list';
import { Distribution } from '@/components/ui/distribution';
import { EventLog, EventLogEmpty, EventLogFilter, EventLogItem } from '@/components/ui/event-log';
import { Highlight, SearchHit, snippetAround } from '@/components/ui/highlight';
import { Meter } from '@/components/ui/meter';
import { QuickTip } from '@/components/ui/quick-tip';
import { Readout } from '@/components/ui/readout';
import { RelativeTime, formatRelative } from '@/components/ui/relative-time';
import { Steps } from '@/components/ui/steps';
import { ToneBadge } from '@/components/ui/tone-badge';
import { INSTRUMENTS_DEMOS } from '@/docs/demos/instruments';

// jsdom lacks a few things Base UI reaches for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= function () {};
Element.prototype.getAnimations ??= () => [];
globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as typeof globalThis.matchMedia;

afterEach(() => {
  vi.useRealTimers();
});

// Thursday 5 November 2026, 10am local
const NOW = new Date(2026, 10, 5, 10, 0);
const at = (day: number, h: number, m = 0) => new Date(2026, 10, day, h, m);

describe('QuickTip', () => {
  it('opens its help in a popover on click', async () => {
    render(<QuickTip content="Half the full fare." />);
    await userEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(await screen.findByText('Half the full fare.')).toBeInTheDocument();
  });

  it('shows a tooltip on focus in hover mode, and renders nothing without content', async () => {
    const { container } = render(
      <>
        <QuickTip trigger="hover" label="About the fare cap" content="12 paid rides in 7 days" />
        <QuickTip content="" />
      </>,
    );
    expect(container.querySelectorAll('[data-slot=quick-tip]')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'About the fare cap' })).toHaveClass('focus-visible:outline-ring');
    await userEvent.tab();
    expect(await screen.findByText('12 paid rides in 7 days')).toBeInTheDocument();
  });
});

describe('ToneBadge', () => {
  it('maps the signal tones onto solid status fills', () => {
    render(
      <>
        <ToneBadge tone="ok">Good service</ToneBadge>
        <ToneBadge tone="system">Delays</ToneBadge>
        <ToneBadge tone="signal" glow>
          Suspended
        </ToneBadge>
        <ToneBadge tone="phosphor">Scheduled</ToneBadge>
        <ToneBadge tone="dim">No service</ToneBadge>
      </>,
    );
    expect(screen.getByText('Good service')).toHaveClass('bg-ok', 'text-ok-foreground', 'font-bold', 'rounded-none');
    expect(screen.getByText('Delays')).toHaveClass('bg-warning', 'text-warning-foreground');
    const suspended = screen.getByText('Suspended');
    expect(suspended).toHaveClass('bg-destructive', 'text-destructive-foreground');
    expect(suspended.className).not.toMatch(/shadow/);
    expect(suspended).not.toHaveAttribute('glow');
    expect(screen.getByText('Scheduled')).toHaveClass('border-foreground');
    expect(screen.getByText('No service')).toHaveClass('bg-secondary');
  });

  it('takes the Headway names, defaults to neutral and passes className through', () => {
    render(
      <>
        <ToneBadge tone="info">Planned work</ToneBadge>
        <ToneBadge tone="destructive">Closed</ToneBadge>
        <ToneBadge className="ml-2">Draft</ToneBadge>
      </>,
    );
    expect(screen.getByText('Planned work')).toHaveClass('bg-info');
    expect(screen.getByText('Closed')).toHaveClass('bg-destructive');
    const draft = screen.getByText('Draft');
    expect(draft).toHaveAttribute('data-tone', 'neutral');
    expect(draft).toHaveClass('ml-2', 'border-foreground');
  });
});

describe('Deadline', () => {
  it('counts calendar days, not 24-hour blocks', () => {
    expect(daysBetween(at(5, 22), at(6, 1))).toBe(1);
    expect(daysBetween(at(5, 1), at(5, 23))).toBe(0);
    expect(daysBetween(at(5, 10), at(2, 10))).toBe(-3);
    // across the end of daylight saving (1 Nov 2026 in the US) it's still whole days
    expect(daysBetween(new Date(2026, 9, 31), new Date(2026, 10, 2))).toBe(2);
  });

  it('says what is left or how late, with a tone for how worried to be', () => {
    expect(formatDeadline(at(15, 17), { now: NOW })).toMatchObject({ text: '10 days left', tone: 'ok' });
    expect(formatDeadline(at(8, 17), { now: NOW })).toMatchObject({ text: '3 days left', tone: 'warning' });
    expect(formatDeadline(at(6, 9), { now: NOW })).toMatchObject({ text: 'Due tomorrow', tone: 'warning' });
    expect(formatDeadline(at(5, 17), { now: NOW })).toMatchObject({ text: 'Due today', tone: 'warning' });
    expect(formatDeadline(at(3, 17), { now: NOW })).toMatchObject({ text: '2 days late', tone: 'destructive' });
    expect(formatDeadline(at(4, 17), { now: NOW })).toMatchObject({ text: '1 day late' });
    expect(formatDeadline(at(15, 17), { now: NOW, status: 'paused', remainingDays: 5 })).toMatchObject({
      text: 'Paused · 5 days left when it resumes',
      tone: 'muted',
    });
    expect(formatDeadline(at(3, 17), { now: NOW, status: 'met' })).toMatchObject({ text: 'Met', tone: 'muted' });
  });

  it('counts hours inside the last two days at hour precision', () => {
    expect(formatDeadline(at(5, 15, 30), { now: NOW, precision: 'hour' }).text).toBe('5 hours left');
    expect(formatDeadline(at(5, 9, 40), { now: NOW, precision: 'hour' })).toMatchObject({ text: '1 hour late', tone: 'destructive' });
    expect(formatDeadline(at(10, 10), { now: NOW, precision: 'hour' }).text).toBe('5 days left');
  });

  it('renders a <time> with the date as its title, as text or a badge', () => {
    const { rerender } = render(<Deadline due={at(3, 17)} now={NOW} locale="en-US" />);
    const time = screen.getByText('2 days late').closest('time')!;
    expect(time).toHaveAttribute('data-tone', 'destructive');
    expect(time).toHaveAttribute('title', expect.stringContaining('Nov 3, 2026'));
    expect(time).toHaveAttribute('dateTime', at(3, 17).toISOString());
    expect(time).toHaveClass('text-error');
    expect(time.querySelector('[data-slot=deadline-mark]')).toHaveClass('bg-destructive');

    rerender(<Deadline due={at(15, 17)} now={NOW} variant="badge" showDate locale="en-US" />);
    const badge = screen.getByText('10 days left · Nov 15').closest('time')!;
    expect(badge).toHaveAttribute('data-slot', 'deadline');
    expect(badge).toHaveClass('bg-ok', 'text-ok-foreground');
  });
});

describe('RelativeTime', () => {
  it('says the largest unit that fits, in words', () => {
    const now = NOW.getTime();
    const f = (offset: number) => formatRelative(now + offset, { now, locale: 'en-US' });
    expect(f(-20_000)).toBe('just now');
    expect(f(-5 * 60_000)).toBe('5 minutes ago');
    expect(f(-3 * 3_600_000)).toBe('3 hours ago');
    expect(f(-26 * 3_600_000)).toBe('yesterday');
    expect(f(2 * 86_400_000)).toBe('in 2 days');
    expect(f(-16 * 86_400_000)).toBe('2 weeks ago');
    expect(formatRelative(now - 5 * 60_000, { now, locale: 'en-US', style: 'narrow' })).toBe('5m ago');
  });

  it('keeps itself current, with the full date as its title', () => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    render(<RelativeTime date={NOW.getTime() - 50 * 60_000} locale="en-US" />);
    const time = screen.getByText('1 hour ago');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('title', expect.stringContaining('2026'));
    act(() => {
      vi.advanceTimersByTime(80 * 60_000);
    });
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });
});

describe('Readout', () => {
  it('shows a big bold figure above its label', () => {
    render(<Readout label="Trains in service" value="412" />);
    const value = screen.getByText('412');
    expect(value).toHaveClass('font-bold', 'tabular-nums', 'text-foreground');
    expect(value.compareDocumentPosition(screen.getByText('Trains in service')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('marks a status tone with a bar, never coloured text, and greys out dim', () => {
    const { container } = render(
      <>
        <Readout label="In service" value="412" tone="ok" />
        <Readout label="Elevators out" value="9" tone="signal" />
        <Readout label="Parked" value="12" tone="dim" />
      </>,
    );
    expect(container.querySelector('[data-tone="ok"] [data-slot=readout-mark]')).toHaveClass('bg-ok');
    expect(container.querySelector('[data-tone="signal"] [data-slot=readout-mark]')).toHaveClass('bg-destructive');
    expect(screen.getByText('9')).not.toHaveClass('text-error');
    expect(screen.getByText('9')).toHaveClass('text-foreground');
    expect(screen.getByText('12')).toHaveClass('text-muted-foreground');
  });
});

describe('Meter', () => {
  it('is a labelled meter with n of m segments filled', () => {
    const { container } = render(<Meter label="Elevators working" value={3} total={5} />);
    const meter = screen.getByRole('meter', { name: 'Elevators working' });
    expect(meter).toHaveAttribute('aria-valuenow', '3');
    expect(meter).toHaveAttribute('aria-valuemax', '5');
    expect(meter).toHaveAttribute('aria-valuetext', '3 of 5');
    const segments = container.querySelectorAll('[data-slot="meter-segment"]');
    expect(segments).toHaveLength(5);
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(3);
    expect(segments[0]).toHaveClass('bg-primary');
    expect(segments[4]).toHaveClass('bg-border');
    expect(screen.getByText('3/5')).toBeInTheDocument();
  });

  it('clamps the value and fills in the tone', () => {
    const { container } = render(<Meter label="Fare machines out" value={9} total={4} tone="signal" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '4');
    expect(container.querySelectorAll('.bg-destructive')).toHaveLength(4);
  });
});

describe('Distribution', () => {
  it('splits the bar by count and leaves out empty parts', () => {
    const { container } = render(
      <Distribution
        label="Riders"
        parts={[
          { name: 'Signals', count: 10 },
          { name: 'A C E', count: 30, tone: 'line-blue' },
          { name: 'Withdrawn', count: 0 },
          { name: 'Planned', count: 5, tone: 'info', dashed: true },
        ]}
      />,
    );
    expect(screen.getByRole('img', { name: 'Riders: Signals 10, A C E 30, Planned 5' })).toHaveClass('bg-sign');
    const parts = container.querySelectorAll<HTMLElement>('[data-slot="distribution-part"]');
    expect(parts).toHaveLength(3);
    expect(parts[0].style.flexGrow).toBe('10');
    expect(parts[0].style.background).toBe('var(--chart-1)');
    expect(parts[1].style.background).toBe('var(--line-blue)');
    expect(parts[1]).toHaveAttribute('title', 'A C E: 30 (67%)');
    expect(parts[2]).toHaveClass('border-dashed');
    expect(parts[2].style.borderColor).toBe('var(--info)');
    expect(container.querySelectorAll('[data-slot="distribution-legend-item"]')).toHaveLength(3);
  });

  it('says none when every part is empty', () => {
    render(<Distribution label="Refunds" parts={[{ name: 'Paid', count: 0 }]} />);
    expect(screen.getByRole('img', { name: 'Refunds: none' })).toBeInTheDocument();
  });
});

describe('EventLog', () => {
  it('lists events with time, source badge and tone', () => {
    render(
      <EventLog aria-label="Activity">
        <EventLogItem time="2:14 PM" dateTime="2026-11-05T14:14" tag="Dispatch" tone="ok" end={<span>#4412</span>}>
          Service restored
        </EventLogItem>
        <EventLogItem time="9:02 AM" tag="Automation" tagVariant="info" tone="signal">
          Trains held
        </EventLogItem>
      </EventLog>,
    );
    const items = within(screen.getByRole('list', { name: 'Activity' })).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Service restored');
    expect(within(items[0]).getByText('2:14 PM').tagName).toBe('TIME');
    expect(within(items[0]).getByText('2:14 PM')).toHaveAttribute('dateTime', '2026-11-05T14:14');
    expect(within(items[0]).getByText('Dispatch')).toHaveClass('bg-secondary', 'font-bold');
    expect(within(items[0]).getByText('#4412')).toBeInTheDocument();
    expect(items[0].querySelector('[data-slot="event-log-node"]')).toHaveClass('bg-ok');
    expect(within(items[1]).getByText('Automation')).toHaveClass('bg-info');
    expect(within(items[1]).getByText('Trains held')).toHaveClass('text-error');
  });

  it('fades in only the events that arrive after it first renders', async () => {
    function Live() {
      const [events, setEvents] = useState(['Incident opened']);
      return (
        <>
          <button onClick={() => setEvents((e) => ['Alert sent', ...e])}>Add</button>
          <EventLog aria-label="Activity">
            {events.map((t) => (
              <EventLogItem key={t} time="now">
                {t}
              </EventLogItem>
            ))}
          </EventLog>
        </>
      );
    }
    render(<Live />);
    await userEvent.click(screen.getByRole('button', { name: 'Add' }));
    const [fresh, old] = screen.getAllByRole('listitem');
    expect(fresh).toHaveTextContent('Alert sent');
    expect(fresh).toHaveAttribute('data-fresh');
    expect(old).not.toHaveAttribute('data-fresh');
  });

  it('filters by source with a toggle group', async () => {
    type Source = 'all' | 'dispatch' | 'rider';
    const events = [
      { id: 1, source: 'dispatch', text: 'Service restored' },
      { id: 2, source: 'rider', text: 'Train held' },
    ];
    function Filtered() {
      const [source, setSource] = useState<Source>('all');
      const shown = events.filter((e) => source === 'all' || e.source === source);
      return (
        <>
          <EventLogFilter<Source>
            value={source}
            onValueChange={setSource}
            options={[
              { value: 'all', label: 'All' },
              { value: 'dispatch', label: 'Dispatch' },
              { value: 'rider', label: 'Riders' },
            ]}
          />
          <EventLog aria-label="Activity">
            {shown.length === 0 && <EventLogEmpty>Nothing</EventLogEmpty>}
            {shown.map((e) => (
              <EventLogItem key={e.id} time="now" tag={e.source}>
                {e.text}
              </EventLogItem>
            ))}
          </EventLog>
        </>
      );
    }
    render(<Filtered />);
    expect(screen.getByRole('group', { name: 'Filter the activity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Dispatch' }));
    expect(screen.getByRole('button', { name: 'Dispatch' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Service restored')).toBeInTheDocument();
    expect(screen.queryByText('Train held')).not.toBeInTheDocument();
    // pressing the pressed one again keeps it selected rather than clearing
    await userEvent.click(screen.getByRole('button', { name: 'Dispatch' }));
    expect(screen.getByRole('button', { name: 'Dispatch' })).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('DescriptionList', () => {
  it('renders a semantic dl with terms and details, and an em dash for empty values', () => {
    const { container } = render(
      <DescriptionList layout="inline" divided>
        <DescriptionItem>
          <DescriptionTerm>Weekday riders</DescriptionTerm>
          <DescriptionDetails>41,327</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Last transfer</DescriptionTerm>
          <DescriptionDetails>{null}</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
    );
    const dl = container.querySelector('dl')!;
    expect(dl).toHaveAttribute('data-layout', 'inline');
    const terms = within(dl).getAllByRole('term');
    expect(terms.map((t) => t.textContent)).toEqual(['Weekday riders', 'Last transfer']);
    expect(terms[0]).toHaveClass('font-bold');
    const details = within(dl).getAllByRole('definition');
    expect(details[0]).toHaveTextContent('41,327');
    expect(details[0]).toHaveClass('tabular-nums');
    expect(details[1]).toHaveTextContent('—None');
    expect(container.querySelectorAll('[data-slot=description-item]')[0]).toHaveClass('border-b');
  });

  it('shows a source as a second line or behind a help button', async () => {
    render(
      <DescriptionList>
        <DescriptionItem>
          <DescriptionTerm>Platforms</DescriptionTerm>
          <DescriptionDetails source="Station survey · 2026">2 island</DescriptionDetails>
        </DescriptionItem>
        <DescriptionItem>
          <DescriptionTerm>Full fare</DescriptionTerm>
          <DescriptionDetails source="Fare schedule, Jan 2026" sourceDisplay="line">
            $2.90
          </DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>,
    );
    expect(screen.getByText('Fare schedule, Jan 2026')).toBeInTheDocument();
    expect(screen.queryByText('Station survey · 2026')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Source' }));
    expect(await screen.findByText('Station survey · 2026')).toBeInTheDocument();
  });
});

describe('Steps', () => {
  it('works out each step’s status from currentStep, with per-item overrides', () => {
    render(
      <Steps currentStep={1} items={[{ title: 'Plan' }, { title: 'Pay' }, { title: 'Transfer', status: 'error' }, { title: 'Arrive' }]} />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items.map((li) => li.getAttribute('data-status'))).toEqual(['finish', 'process', 'error', 'wait']);
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]!.querySelector('[data-slot=steps-marker]')).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(items[1]!.querySelector('[data-slot=steps-marker]')).toHaveClass('bg-warning', 'text-warning-foreground');
    expect(items[2]!.querySelector('[data-slot=steps-marker]')).toHaveClass('bg-destructive');
    expect(items[2]).toHaveTextContent('Transfer (error)');
  });

  it('makes steps clickable, except disabled ones', async () => {
    const onStepClick = vi.fn();
    render(
      <Steps currentStep={2} onStepClick={onStepClick} items={[{ title: 'Plan' }, { title: 'Pay', disabled: true }, { title: 'Ride' }]} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Plan/ }));
    expect(onStepClick).toHaveBeenCalledWith(0);
    expect(screen.getByRole('button', { name: /Pay/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Ride/ })).toHaveAttribute('aria-current', 'step');
  });
});

describe('Highlight', () => {
  it('marks every term, ignoring case, longest first, as a solid panel', () => {
    const { container } = render(
      <Highlight text="Service change on the SHUTTLE; service resumes Monday." terms={['service', 'service change', 'shuttle']} />,
    );
    const marks = [...container.querySelectorAll('mark')];
    expect(marks.map((m) => m.textContent)).toEqual(['Service change', 'SHUTTLE', 'service']);
    expect(marks[0]).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('treats terms as text, not patterns', () => {
    const { container } = render(<Highlight text="Notice SC-2026.118 (a)" terms={['SC-2026.118 (a)', '.*']} />);
    expect([...container.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['SC-2026.118 (a)']);
  });

  it('trims to a snippet with ellipses', () => {
    const long = `${'lorem '.repeat(40)}the shuttle bus ${'ipsum '.repeat(40)}`;
    const s = snippetAround(long, 'shuttle', 30);
    expect(s.startsWith('…')).toBe(true);
    expect(s.endsWith('…')).toBe(true);
    expect(s).toContain('shuttle');
    expect(s.length).toBeLessThan(80);
  });

  it('SearchHit marks delimited snippets and is clickable', async () => {
    const onClick = vi.fn();
    render(<SearchHit citation="SC-2026-130" title="Escalator work" snippet="a **shuttle** bus runs" delimiter="**" onClick={onClick} />);
    const hit = screen.getByRole('button', { name: /SC-2026-130 Escalator work/ });
    expect(within(hit).getByText('shuttle', { selector: 'mark' })).toBeInTheDocument();
    await userEvent.click(hit);
    expect(onClick).toHaveBeenCalled();
  });
});

describe('INSTRUMENTS_DEMOS', () => {
  it('renders every demo', () => {
    for (const Demo of Object.values(INSTRUMENTS_DEMOS)) {
      const { unmount } = render(<Demo />);
      unmount();
    }
  });
});
