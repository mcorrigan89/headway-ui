'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// A square box with a heavy edge: hollow until checked, then a solid panel
// (white in dark mode, black on the light wall) with the tick knocked out.

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-5 shrink-0 items-center justify-center rounded-none border-2 border-foreground bg-transparent transition-colors outline-none group-has-disabled/field:opacity-40 after:absolute after:-inset-x-3 after:-inset-y-2 hover:bg-accent focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-4"
      >
        <CheckIcon strokeWidth={3.5} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
