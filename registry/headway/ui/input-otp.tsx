'use client';

import * as React from 'react';
import { OTPField } from '@base-ui/react/otp-field';
import { MinusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// A one-time code, one character per black box. `length` is required; render
// that many <InputOTPSlot>s, grouped however the code reads. Slots in a group
// share their edges; the focused one turns white-edged and ringed. `value` is
// a string.

function InputOTP({ className, ...props }: OTPField.Root.Props) {
  return <OTPField.Root data-slot="input-otp" className={cn('flex items-center gap-2 data-disabled:opacity-40', className)} {...props} />;
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="input-otp-group" className={cn('flex items-center', className)} {...props} />;
}

function InputOTPSlot({ className, ...props }: OTPField.Input.Props) {
  return (
    <OTPField.Input
      data-slot="input-otp-slot"
      className={cn(
        'relative m-0 size-11 rounded-none border-2 border-input bg-sign p-0 text-center text-xl font-bold text-sign-foreground tabular-nums caret-sign-foreground [color-scheme:dark] transition-colors outline-none not-first:-ml-0.5 hover:z-10 hover:border-muted-foreground focus:z-20 focus:border-sign-foreground focus:outline-3 focus:outline-solid focus:outline-offset-2 focus:outline-ring disabled:cursor-not-allowed aria-invalid:border-error',
        className,
      )}
      {...props}
    />
  );
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      className="flex items-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4"
      role="separator"
      {...props}
    >
      <MinusIcon strokeWidth={3} />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
