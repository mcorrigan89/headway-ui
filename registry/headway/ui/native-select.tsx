import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// The browser's own <select> in a black box like <Input> — for long lists,
// phones, and forms that should work before JavaScript loads. Use <Select>
// for a styled popup.

type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default';
};

function NativeSelect({ className, size = 'default', ...props }: NativeSelectProps) {
  return (
    <div
      className={cn('group/native-select relative w-fit has-[select:disabled]:opacity-40', className)}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className="h-10 w-full min-w-0 appearance-none rounded-none border-2 border-input bg-sign py-1 pr-9 pl-3 text-sm text-sign-foreground [color-scheme:dark] transition-colors outline-none select-none hover:border-muted-foreground focus-visible:border-sign-foreground focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:cursor-not-allowed aria-invalid:border-error data-[size=sm]:h-8 data-[size=sm]:pl-2.5"
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-sign-foreground select-none"
        strokeWidth={2.5}
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({ className, ...props }: React.ComponentProps<'option'>) {
  return <option data-slot="native-select-option" className={cn('bg-popover text-popover-foreground', className)} {...props} />;
}

function NativeSelectOptGroup({ className, ...props }: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup data-slot="native-select-optgroup" className={cn('bg-popover font-bold text-popover-foreground', className)} {...props} />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
