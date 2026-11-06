import * as React from 'react';

import { cn } from '@/lib/utils';

// One bar split by share — trips by line, delays by cause — with a legend of
// square swatches beneath. The bar is a black band, like a sign, so the
// colours read the same on the charcoal ground and the white wall. Parts take
// the chart palette in order (chart-1 to chart-5), or a tone you name: a chart
// colour, a status (ok, info, warning, destructive), a route colour
// (line-blue … line-shuttle) for parts that stand for lines, the signal-tone
// names, or any CSS colour. Dashed parts are outlined instead of filled, for
// "scheduled" or "not yet". Square, flat, no glow; parts with no count are
// left out.
//
//   <Distribution label="Riders by line" parts={[{ name: 'A C E', count: 42, tone: 'line-blue' }, …]} />

const TONES: Record<string, string> = {
  'chart-1': 'var(--chart-1)',
  'chart-2': 'var(--chart-2)',
  'chart-3': 'var(--chart-3)',
  'chart-4': 'var(--chart-4)',
  'chart-5': 'var(--chart-5)',
  neutral: 'var(--chart-1)',
  ok: 'var(--ok)',
  info: 'var(--info)',
  warning: 'var(--warning)',
  destructive: 'var(--destructive)',
  muted: 'var(--line-shuttle)',
  // the route colours
  'line-blue': 'var(--line-blue)',
  'line-orange': 'var(--line-orange)',
  'line-lime': 'var(--line-lime)',
  'line-brown': 'var(--line-brown)',
  'line-grey': 'var(--line-grey)',
  'line-yellow': 'var(--line-yellow)',
  'line-red': 'var(--line-red)',
  'line-green': 'var(--line-green)',
  'line-purple': 'var(--line-purple)',
  'line-shuttle': 'var(--line-shuttle)',
  // the signal-tone names
  phosphor: 'var(--chart-1)',
  system: 'var(--warning)',
  signal: 'var(--destructive)',
  dim: 'var(--line-shuttle)',
};

type DistributionTone =
  | 'chart-1'
  | 'chart-2'
  | 'chart-3'
  | 'chart-4'
  | 'chart-5'
  | 'neutral'
  | 'ok'
  | 'info'
  | 'warning'
  | 'destructive'
  | 'muted'
  | 'line-blue'
  | 'line-orange'
  | 'line-lime'
  | 'line-brown'
  | 'line-grey'
  | 'line-yellow'
  | 'line-red'
  | 'line-green'
  | 'line-purple'
  | 'line-shuttle'
  | 'phosphor'
  | 'system'
  | 'signal'
  | 'dim'
  | (string & {});

type DistributionPart = {
  name: string;
  count: number;
  /** defaults to the next chart colour */
  tone?: DistributionTone;
  /** outlined rather than filled: scheduled, or not yet */
  dashed?: boolean;
};

function Distribution({
  label,
  parts,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'children'> & {
  label: string;
  parts: DistributionPart[];
}) {
  const shown = parts
    .map((p, i) => ({ ...p, color: p.tone ? (TONES[p.tone] ?? p.tone) : `var(--chart-${(i % 5) + 1})` }))
    .filter((p) => p.count > 0);
  const total = shown.reduce((sum, p) => sum + p.count, 0);
  const summary = shown.map((p) => `${p.name} ${p.count}`).join(', ');
  return (
    <div data-slot="distribution" className={cn('flex min-w-0 flex-col gap-2', className)} {...props}>
      <div
        role="img"
        aria-label={shown.length ? `${label}: ${summary}` : `${label}: none`}
        className="flex h-5 w-full gap-0.5 bg-sign p-0.5"
      >
        {shown.map((p) => (
          <span
            key={p.name}
            data-slot="distribution-part"
            title={`${p.name}: ${p.count} (${Math.round((p.count / total) * 100)}%)`}
            className={cn(
              'min-w-0.5 transition-[flex-grow] duration-200 ease-out motion-reduce:transition-none',
              p.dashed && 'border-2 border-dashed',
            )}
            style={{
              flexGrow: p.count,
              flexBasis: 0,
              background: p.dashed ? undefined : p.color,
              borderColor: p.dashed ? p.color : undefined,
            }}
          />
        ))}
      </div>
      <ul aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <li className="font-bold text-foreground">{label}</li>
        {shown.map((p) => (
          <li key={p.name} data-slot="distribution-legend-item" className="flex items-center gap-1.5">
            {/* a black edge, so a pale colour still shows on the white wall */}
            <span className="inline-block size-3 shrink-0 border-2 border-sign bg-sign">
              <span
                className={cn('block size-full', p.dashed && 'border border-dashed')}
                style={p.dashed ? { borderColor: p.color } : { background: p.color }}
              />
            </span>
            {p.name} <span className="font-bold text-foreground tabular-nums">{p.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { Distribution, type DistributionPart, type DistributionTone };
