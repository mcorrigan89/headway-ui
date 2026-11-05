import * as React from 'react';

import { Badge } from '@/components/ui/badge';

// A status badge picked by tone rather than by colour, so a screen can map
// its states (in service, delayed, suspended) onto a few meanings. It is the
// square, bold Headway <Badge>: a solid status fill with its own type for ok,
// info, warning and destructive; a bordered neutral for normal; and the
// secondary band for inactive.
//
// It also takes the older signal-tone names, so screens written against them
// keep working: phosphor (normal), ok, system (waiting), signal (attention)
// and dim (inactive). `glow` is accepted and ignored: Headway has no glow.
//
//   <ToneBadge tone="warning">Delays</ToneBadge>

const TONE_VARIANT = {
  neutral: 'outline',
  ok: 'ok',
  info: 'info',
  warning: 'warning',
  destructive: 'destructive',
  muted: 'secondary',
  // the signal-tone names
  phosphor: 'outline',
  system: 'warning',
  signal: 'destructive',
  dim: 'secondary',
} as const;

type Tone = keyof typeof TONE_VARIANT;

function ToneBadge({
  tone = 'neutral',
  glow: _glow,
  className,
  ...props
}: React.ComponentProps<typeof Badge> & {
  tone?: Tone;
  /** kept for compatibility; has no effect */
  glow?: boolean;
}) {
  return <Badge data-tone={tone} variant={TONE_VARIANT[tone] ?? 'outline'} className={className} {...props} />;
}

export { ToneBadge, type Tone };
