'use client';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';

import { cn } from '@/lib/utils';

// A square rocker: off, a hollow box with the block on the left; on, the box
// fills (white in dark mode, black on the light wall) and the block slides
// right, knocked out of it.

function Switch({
  className,
  size = 'default',
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: 'sm' | 'default';
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        'peer group/switch relative inline-flex shrink-0 items-center rounded-none border-2 border-foreground bg-transparent p-0.5 transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:border-error data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-5 data-[size=sm]:w-9 data-checked:border-primary data-checked:bg-primary data-disabled:cursor-not-allowed data-disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-none bg-foreground transition-transform duration-150 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-checked:bg-primary-foreground group-data-[size=default]/switch:data-checked:translate-x-5 group-data-[size=sm]/switch:data-checked:translate-x-4 data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
