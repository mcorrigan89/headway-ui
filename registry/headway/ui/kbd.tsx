import * as React from 'react';

import { cn } from '@/lib/utils';

// A key on the keyboard, drawn as a small square key: ⌘, K, Esc. Group a
// chord with <KbdGroup>.

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-none border border-border bg-muted px-1 font-mono text-[11px] font-bold text-foreground select-none [&_svg:not([class*='size-'])]:size-3",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'kbd'>) {
  return <kbd data-slot="kbd-group" className={cn('inline-flex items-center gap-1', className)} {...props} />;
}

export { Kbd, KbdGroup };
