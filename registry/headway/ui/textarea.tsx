import * as React from 'react';

import { cn } from '@/lib/utils';

// A multi-line text box, black in either mode like <Input>: a grey edge that
// turns white on focus, with the focus ring outside it. It grows with its text.
function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-20 w-full rounded-none border-2 border-input bg-sign px-3 py-2 text-base text-sign-foreground [color-scheme:dark] transition-colors outline-none placeholder:text-sign-foreground/60 hover:border-muted-foreground focus-visible:border-sign-foreground focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error md:text-sm',
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
