import * as React from 'react';

import { cn } from '@/lib/utils';

// Busy, for how long unknown: a ring of square ticks that steps round like a
// station clock rather than spinning smoothly. Sized and coloured by
// className, like an icon; it takes the colour of the text around it.

const TICKS = 8;

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="butt"
      className={cn('size-4 animate-[spin_0.8s_steps(8)_infinite] motion-reduce:animate-[spin_2.4s_steps(8)_infinite]', className)}
      {...props}
    >
      {Array.from({ length: TICKS }, (_, i) => (
        <line key={i} x1="12" y1="2" x2="12" y2="7" opacity={(i + 1) / TICKS} transform={`rotate(${(i * 360) / TICKS} 12 12)`} />
      ))}
    </svg>
  );
}

export { Spinner };
