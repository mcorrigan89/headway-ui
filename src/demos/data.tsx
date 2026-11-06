import { useState, type ReactNode } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { RouteBullet } from '@/components/ui/route-bullet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';

// Demos for the data group: scroll-area, resizable, progress, calendar,
// date-picker, carousel, chart and sonner.

const STOPS = [
  'Inwood–207 St',
  'Dyckman St',
  '190 St',
  '181 St',
  '175 St',
  '168 St',
  '163 St',
  '155 St',
  '145 St',
  '135 St',
  '125 St',
  '116 St',
  '110 St',
  '103 St',
  '96 St',
  '86 St',
  '81 St',
  '72 St',
  '59 St–Columbus Circle',
  '50 St',
  '42 St–Port Authority',
];

// average weekday riders, in thousands (illustrative)
const RIDERSHIP = [
  { line: 'A', y2019: 620, y2025: 545 },
  { line: '1', y2019: 560, y2025: 470 },
  { line: '4', y2019: 760, y2025: 600 },
  { line: '7', y2019: 510, y2025: 455 },
  { line: 'L', y2019: 400, y2025: 330 },
  { line: 'G', y2019: 160, y2025: 140 },
];

const RIDERSHIP_CONFIG = {
  y2019: { label: '2019', color: 'var(--chart-1)' },
  y2025: { label: '2025', color: 'var(--chart-2)' },
} satisfies ChartConfig;

const STATIONS = [
  { name: 'Times Sq–42 St', routes: ['1', '2', '3', '7', 'N', 'Q', 'R', 'W', 'S'], tile: 'bg-line-red' },
  { name: 'Union Sq–14 St', routes: ['4', '5', '6', 'L', 'N', 'Q', 'R', 'W'], tile: 'bg-line-green' },
  { name: 'Court Sq', routes: ['7', 'E', 'M', 'G'], tile: 'bg-line-purple' },
  { name: 'Broadway Junction', routes: ['A', 'C', 'J', 'Z', 'L'], tile: 'bg-line-blue' },
  { name: 'Coney Island', routes: ['D', 'F', 'N', 'Q'], tile: 'bg-line-orange' },
];

function CalendarDemo() {
  const [trip, setTrip] = useState<DateRange | undefined>({ from: new Date(2026, 10, 13), to: new Date(2026, 10, 16) });
  return <Calendar mode="range" selected={trip} onSelect={setTrip} defaultMonth={new Date(2026, 10, 1)} />;
}

function DatePickerDemo() {
  const [day, setDay] = useState<Date | undefined>();
  return (
    <div className="grid max-w-xs gap-2">
      <Label htmlFor="demo-trip-date">Travel date</Label>
      <DatePicker id="demo-trip-date" value={day} onValueChange={setDay} calendar={{ defaultMonth: new Date(2026, 10, 1) }} />
      <p className="text-sm text-muted-foreground">
        {day ? `Planned service for ${day.toDateString()}.` : 'Weekday service unless you pick a date.'}
      </p>
    </div>
  );
}

export const DATA_DEMOS: Record<string, () => ReactNode> = {
  'scroll-area': () => (
    <ScrollArea className="on-sign h-48 max-w-xs border border-border bg-card">
      <ol className="p-4 text-sm">
        {STOPS.map((stop, i) => (
          <li key={stop} className="flex items-baseline justify-between gap-4 py-1">
            <span className={i === 0 ? 'font-bold' : undefined}>{stop}</span>
            <span className="text-muted-foreground tabular-nums">{i * 2} min</span>
          </li>
        ))}
      </ol>
    </ScrollArea>
  ),
  resizable: () => (
    <ResizablePanelGroup orientation="horizontal" className="on-sign min-h-56 max-w-2xl border border-border bg-card">
      <ResizablePanel defaultSize="30%" minSize="20%">
        <div className="flex h-full flex-col gap-2 p-4 text-sm">
          <span className="font-bold">Lines</span>
          {['A', 'G', 'L', '7'].map((r) => (
            <span key={r} className="flex items-center gap-2">
              <RouteBullet route={r} size="sm" /> Good service
            </span>
          ))}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize="70%">
        <ResizablePanelGroup orientation="vertical">
          <ResizablePanel defaultSize="60%" minSize="30%">
            <div className="flex h-full items-center justify-center text-sm font-bold">System map</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize="40%" minSize="20%">
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Next A to Far Rockaway: 4 min</div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  ),
  progress: () => (
    <div className="grid max-w-sm gap-5">
      <Progress value={64}>
        <ProgressLabel>Second Avenue Subway, phase 2</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={100} tone="ok">
        <ProgressLabel>Elevator, 72 St</ProgressLabel>
        <ProgressValue />
      </Progress>
      <Progress value={null}>
        <ProgressLabel>Loading arrivals</ProgressLabel>
      </Progress>
    </div>
  ),
  calendar: () => <CalendarDemo />,
  'date-picker': () => <DatePickerDemo />,
  carousel: () => (
    <div className="px-12">
      <Carousel className="max-w-md" opts={{ align: 'start' }}>
        <CarouselContent>
          {STATIONS.map((s) => (
            <CarouselItem key={s.name} className="basis-2/3">
              <div className="flex aspect-video flex-col border border-border">
                <div className={`flex-1 ${s.tile}`} />
                <div className="sign sign-rule flex flex-col gap-2 px-3 pt-4 pb-3">
                  <span className="text-base leading-tight font-bold tracking-tight">{s.name}</span>
                  <span className="flex flex-wrap gap-1">
                    {s.routes.map((r) => (
                      <RouteBullet key={r} route={r} size="sm" />
                    ))}
                  </span>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  ),
  chart: () => (
    <ChartContainer config={RIDERSHIP_CONFIG} className="max-w-xl">
      <BarChart data={RIDERSHIP} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="line" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => `${v} train · thousands`} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="y2019" fill="var(--color-y2019)" />
        <Bar dataKey="y2025" fill="var(--color-y2025)" />
      </BarChart>
    </ChartContainer>
  ),
  sonner: () => (
    <div className="flex flex-wrap gap-2">
      <Toaster />
      <Button variant="outline" onClick={() => toast('Trip saved', { description: 'Inwood–207 St to Far Rockaway' })}>
        Default
      </Button>
      <Button variant="outline" onClick={() => toast.success('Good service', { description: 'A C E trains are running on schedule.' })}>
        Success
      </Button>
      <Button variant="outline" onClick={() => toast.warning('Delays', { description: 'Northbound 4 5 trains are running with delays.' })}>
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error('Suspended', { description: 'No L trains between Broadway Junction and Rockaway Pkwy.' })}
      >
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.info('Planned work', { description: 'Weekend: F trains run via the E line.' })}>
        Info
      </Button>
    </div>
  ),
};
