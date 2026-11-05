import * as React from 'react';

import { cn } from '@/lib/utils';

// An n-of-m count drawn as a row of square segments: cars in service of those
// in the consist, elevators working of those in the station. Filled segments
// are a solid panel (white on the dark ground, black on the light wall), or a
// status fill when the count means something — red for what's out of
// service; the rest are the grey hairline colour. The label sits beneath in
// muted type with the count in bold.
//
//   <Meter label="Elevators working" value={3} total={5} />

const FILL = {
  neutral: 'bg-primary',
  ok: 'bg-ok',
  info: 'bg-info',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  // the signal-tone names
  phosphor: 'bg-primary',
  signal: 'bg-destructive',
  system: 'bg-warning',
} as const;

type MeterTone = keyof typeof FILL;

function Meter({
  label,
  value,
  total,
  tone = 'neutral',
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  label: string;
  value: number;
  total: number;
  tone?: MeterTone;
}) {
  const segments = Math.max(Math.floor(total), 1);
  const filled = Math.min(Math.max(value, 0), segments);
  return (
    <div data-slot="meter" data-tone={tone} className={cn('flex flex-col gap-2', className)} {...props}>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={filled}
        aria-valuetext={`${filled} of ${total}`}
        aria-label={label}
        className="flex h-5 gap-1"
      >
        {Array.from({ length: segments }, (_, i) => (
          <span
            key={i}
            data-slot="meter-segment"
            data-filled={i < filled ? '' : undefined}
            className={cn('h-full w-3 shrink-0', i < filled ? FILL[tone] : 'bg-border')}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">
        {label} <span className="font-bold text-foreground tabular-nums">{`${filled}/${total}`}</span>
      </span>
    </div>
  );
}

export { Meter, type MeterTone };
