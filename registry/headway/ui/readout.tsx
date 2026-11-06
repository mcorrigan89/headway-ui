import * as React from 'react';

import { cn } from '@/lib/utils';

// A figure on a dashboard strip — trains in service, minutes to the next
// arrival, stations with outages — read like an arrival board: a big bold
// number with tight tracking and tabular figures, its label beneath in small
// muted type. The figure stays in the foreground colour; a tone marks it with
// a short bar in the status fill above the figure (status colours are fills,
// not text), and dim greys the figure out.
//
//   <Readout label="Trains in service" value="412" tone="ok" />

const MARKER = {
  neutral: '',
  ok: 'bg-ok',
  info: 'bg-info',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  muted: '',
  // the signal-tone names
  phosphor: '',
  system: 'bg-warning',
  signal: 'bg-destructive',
  dim: '',
} as const;

type ReadoutTone = keyof typeof MARKER;

function Readout({
  label,
  value,
  tone = 'neutral',
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  label: React.ReactNode;
  value: React.ReactNode;
  tone?: ReadoutTone;
}) {
  const dim = tone === 'dim' || tone === 'muted';
  return (
    <div data-slot="readout" data-tone={tone} className={cn('flex flex-col gap-1.5', className)} {...props}>
      {/* the bar keeps its height when there's no tone, so a row of readouts lines up */}
      <span aria-hidden data-slot="readout-mark" className={cn('h-1.5 w-8 shrink-0', MARKER[tone])} />
      <span
        data-slot="readout-value"
        className={cn('text-4xl leading-none font-bold tracking-tight tabular-nums', dim ? 'text-muted-foreground' : 'text-foreground')}
      >
        {value}
      </span>
      <span data-slot="readout-label" className="text-sm text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export { Readout, type ReadoutTone };
