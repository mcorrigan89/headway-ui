import * as React from 'react';

import { routeColor, type LineColor } from '@/components/ui/route-bullet';
import { cn } from '@/lib/utils';

// The line diagram from inside the train, as a stepper, progress or
// timeline: a line in its route colour, a dot per stop, and the current stop
// marked. Stops already passed go dark, as on the cars' lit maps.
//
//   <StripMap route="F" current={1} stops={[{ label: 'Jay St' }, { label: 'York St' }, …]} />

type StripMapStop = {
  label: React.ReactNode;
  description?: React.ReactNode;
  /** Shown beside the label, such as the <RouteBullet>s you can change to. */
  transfers?: React.ReactNode;
};

type StripMapProps = Omit<React.ComponentProps<'ol'>, 'color'> & {
  stops: StripMapStop[];
  /** Index of the current stop. Earlier stops are passed; without it every stop is ahead. */
  current?: number;
  /** A route letter or number; sets the line colour. */
  route?: string;
  /** The line colour, if not set by route. */
  color?: LineColor;
  orientation?: 'horizontal' | 'vertical';
};

type StopState = 'passed' | 'current' | 'ahead';

const DOT: Record<StopState, string> = {
  passed: 'size-3 bg-sign',
  current: 'size-6 border-4 border-(--strip) bg-white',
  ahead: 'size-3.5 bg-white',
};

const LABEL: Record<StopState, string> = {
  passed: 'text-muted-foreground',
  current: 'font-bold text-foreground',
  ahead: 'text-foreground',
};

function StripMap({ stops, current, route, color, orientation = 'horizontal', className, style, ...props }: StripMapProps) {
  const line = color ?? routeColor(route) ?? 'shuttle';
  const vertical = orientation === 'vertical';
  return (
    <ol
      data-slot="strip-map"
      data-orientation={orientation}
      style={{ '--strip': `var(--line-${line})`, ...style } as React.CSSProperties}
      className={cn('flex w-full text-sm', vertical ? 'flex-col' : 'flex-row', className)}
      {...props}
    >
      {stops.map((stop, i) => {
        const state: StopState = current === undefined || i > current ? 'ahead' : i === current ? 'current' : 'passed';
        const first = i === 0;
        const last = i === stops.length - 1;
        return (
          <li
            key={i}
            data-slot="strip-map-stop"
            data-state={state}
            aria-current={state === 'current' ? 'step' : undefined}
            className={cn('flex min-w-0', vertical ? 'flex-row gap-3' : 'flex-1 flex-col items-center gap-2 text-center')}
          >
            {/* the line through this stop: a segment each side of the dot. Down
                the side, the dot sits level with the label's first line. */}
            {vertical ? (
              <span aria-hidden className="relative w-6 shrink-0 self-stretch">
                {!first && <span className="absolute top-0 left-1/2 h-3 w-1.5 -translate-x-1/2 bg-(--strip)" />}
                {!last && <span className="absolute top-3 bottom-0 left-1/2 w-1.5 -translate-x-1/2 bg-(--strip)" />}
                <span className={cn('absolute top-3 left-1/2 -translate-1/2 rounded-full', DOT[state])} />
              </span>
            ) : (
              <span aria-hidden className="relative flex h-6 w-full shrink-0 items-center justify-center">
                {!first && <span className="absolute right-1/2 left-0 h-1.5 bg-(--strip)" />}
                {!last && <span className="absolute right-0 left-1/2 h-1.5 bg-(--strip)" />}
                <span className={cn('relative rounded-full', DOT[state])} />
              </span>
            )}
            <span className={cn('flex min-w-0 flex-col gap-0.5', vertical ? 'pt-0.5 pb-5' : 'items-center px-1')}>
              <span className={cn('flex flex-wrap items-center gap-1.5 leading-tight', !vertical && 'justify-center', LABEL[state])}>
                {stop.label}
                {stop.transfers}
              </span>
              {stop.description && <span className="text-xs text-muted-foreground">{stop.description}</span>}
              {state === 'passed' && <span className="sr-only">(passed)</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export { StripMap, type StripMapStop };
