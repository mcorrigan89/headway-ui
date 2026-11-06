'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';

import { cn } from '@/lib/utils';

// Round, so it reads apart from a checkbox: a heavy ring with a solid dot in
// the chosen one, like a stop on the strip map.

function RadioGroup({ className, ...props }: RadioGroupPrimitive.Props) {
  return <RadioGroupPrimitive data-slot="radio-group" className={cn('grid w-full gap-3', className)} {...props} />;
}

function RadioGroupItem({ className, ...props }: RadioPrimitive.Root.Props) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        'group/radio-group-item peer relative flex aspect-square size-5 shrink-0 rounded-full border-2 border-foreground bg-transparent transition-colors outline-none after:absolute after:-inset-x-3 after:-inset-y-2 hover:bg-accent focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error data-checked:border-primary',
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" className="flex size-full items-center justify-center">
        <span className="size-2.5 rounded-full bg-primary" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
