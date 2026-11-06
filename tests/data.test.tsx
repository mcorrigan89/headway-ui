import { useState } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Calendar } from '@/components/ui/calendar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ChartContainer, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { DatePicker } from '@/components/ui/date-picker';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { Toaster } from '@/components/ui/sonner';

// jsdom has no ResizeObserver or IntersectionObserver (recharts and Embla use
// them) and no matchMedia (Embla); nothing here needs real measurements.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
globalThis.IntersectionObserver ??= class {
  root = null;
  rootMargin = '';
  thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as unknown as typeof IntersectionObserver;
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  }) as MediaQueryList;

describe('Progress', () => {
  it('reports its value, labelled', () => {
    render(
      <Progress value={64}>
        <ProgressLabel>Second Avenue Subway</ProgressLabel>
        <ProgressValue />
      </Progress>,
    );
    const bar = screen.getByRole('progressbar', { name: 'Second Avenue Subway' });
    expect(bar).toHaveAttribute('aria-valuenow', '64');
    expect(screen.getByText('64%')).toBeInTheDocument();
  });

  it('is indeterminate when the length is unknown', () => {
    const { container } = render(
      <Progress value={null}>
        <ProgressLabel>Loading arrivals</ProgressLabel>
      </Progress>,
    );
    expect(screen.getByRole('progressbar', { name: 'Loading arrivals' })).not.toHaveAttribute('aria-valuenow');
    expect(container.querySelector('[data-slot=progress-indicator]')).toHaveAttribute('data-indeterminate');
  });
});

describe('Calendar', () => {
  function Single() {
    const [day, setDay] = useState<Date | undefined>();
    return (
      <>
        <Calendar mode="single" selected={day} onSelect={setDay} defaultMonth={new Date(2026, 10, 1)} />
        <p>Picked: {day ? day.getDate() : 'none'}</p>
      </>
    );
  }

  it('selects the day you click', async () => {
    render(<Single />);
    expect(screen.getByText('November 2026')).toBeInTheDocument();
    const grid = screen.getByRole('grid');
    const day = within(grid).getByRole('button', { name: /November 13, 2026/ });
    await userEvent.click(day);
    expect(screen.getByText('Picked: 13')).toBeInTheDocument();
    // the grid re-renders on select, so look the day up again
    expect(within(screen.getByRole('grid')).getByRole('button', { name: /November 13, 2026/ })).toHaveAttribute(
      'data-selected-single',
      'true',
    );
  });
});

describe('DatePicker', () => {
  function Example() {
    const [day, setDay] = useState<Date | undefined>();
    return <DatePicker aria-label="Travel date" value={day} onValueChange={setDay} calendar={{ defaultMonth: new Date(2026, 10, 1) }} />;
  }

  it('opens a calendar and shows the picked date', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: /^Travel date: / });
    expect(trigger).toHaveTextContent('Pick a date');
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('button', { name: /November 20, 2026/ }));
    expect(trigger).toHaveTextContent(
      new Date(2026, 10, 20).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    );
    expect(trigger).not.toHaveAttribute('data-placeholder');
  });
});

describe('Carousel', () => {
  // Embla measures with offsetLeft/offsetWidth, which jsdom leaves at 0: make
  // the viewport and each slide 300px wide, slides laid end to end.
  const WIDTH = 300;
  const saved: Record<string, PropertyDescriptor | undefined> = {};
  beforeEach(() => {
    for (const key of ['offsetWidth', 'offsetLeft', 'offsetHeight'] as const) {
      saved[key] = Object.getOwnPropertyDescriptor(HTMLElement.prototype, key);
    }
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, get: () => WIDTH });
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 100 });
    Object.defineProperty(HTMLElement.prototype, 'offsetLeft', {
      configurable: true,
      get(this: HTMLElement) {
        if (this.dataset.slot !== 'carousel-item' || !this.parentElement) return 0;
        return [...this.parentElement.children].indexOf(this) * WIDTH;
      },
    });
  });
  afterEach(() => {
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(HTMLElement.prototype, key, descriptor);
    }
  });

  it('has labelled previous and next buttons that move the slides', async () => {
    render(
      <Carousel>
        <CarouselContent>
          {['Times Sq', 'Union Sq', 'Court Sq'].map((s) => (
            <CarouselItem key={s}>{s}</CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>,
    );
    expect(screen.getByRole('region')).toHaveAttribute('aria-roledescription', 'carousel');
    expect(screen.getAllByRole('group')).toHaveLength(3);
    const prev = screen.getByRole('button', { name: 'Previous slide' });
    const next = screen.getByRole('button', { name: 'Next slide' });
    // on the first slide only "next" goes anywhere
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();
    await userEvent.click(next);
    expect(prev).toBeEnabled();
    await userEvent.click(prev);
    expect(prev).toBeDisabled();
  });
});

describe('Chart', () => {
  const config = {
    y2019: { label: '2019', color: 'var(--chart-1)' },
    y2025: { label: '2025', color: 'var(--chart-2)' },
  } satisfies ChartConfig;

  // recharts measures its container once on mount; jsdom reports 0 × 0
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ width: 400, height: 200 }));
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a panel and publishes each series colour', () => {
    const { container } = render(
      <ChartContainer config={config} style={{ width: 400, height: 200 }}>
        <div />
      </ChartContainer>,
    );
    expect(container.querySelector('[data-slot=chart]')).toBeInTheDocument();
    const css = container.querySelector('style')!.textContent!;
    expect(css).toContain('--color-y2019: var(--chart-1);');
    expect(css).toContain('--color-y2025: var(--chart-2);');
  });

  it('tooltip lists every series value at the point, named from the config', () => {
    render(
      <ChartContainer config={config}>
        <ChartTooltipContent
          active
          label="A"
          payload={[
            { dataKey: 'y2019', name: 'y2019', value: 620, color: 'var(--chart-1)', payload: {}, graphicalItemId: 'y2019' },
            { dataKey: 'y2025', name: 'y2025', value: 1545, color: 'var(--chart-2)', payload: {}, graphicalItemId: 'y2025' },
          ]}
        />
      </ChartContainer>,
    );
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('2019')).toBeInTheDocument();
    expect(screen.getByText('620')).toBeInTheDocument();
    expect(screen.getByText('1,545')).toBeInTheDocument();
  });
});

describe('Toaster', () => {
  it('shows a toast with its title and description', async () => {
    render(<Toaster />);
    act(() => {
      toast.warning('Delays', { description: 'Northbound 4 5 trains are delayed.' });
    });
    expect(await screen.findByText('Delays')).toBeInTheDocument();
    expect(screen.getByText('Northbound 4 5 trains are delayed.')).toBeInTheDocument();
    expect(screen.getByText('Delays').closest('[data-sonner-toast]')).toHaveAttribute('data-type', 'warning');
  });
});
