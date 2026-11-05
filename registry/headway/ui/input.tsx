import * as React from 'react';
import { Input as InputPrimitive } from '@base-ui/react/input';

import { cn } from '@/lib/utils';

// A square text box, black in either mode: a black well with a grey edge that turns white on
// focus, with the focus ring outside it. Its browser chrome (the caret,
// date and time pickers) is always dark to match.
function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-10 w-full min-w-0 rounded-none border-2 [color-scheme:dark] border-input bg-sign px-3 py-1 text-base text-sign-foreground transition-colors outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-bold file:text-sign-foreground placeholder:text-sign-foreground/60 hover:border-muted-foreground focus-visible:border-sign-foreground focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
