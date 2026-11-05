'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// One date, picked from a calendar in a black popover. The trigger is a black
// box like a text input, its edge white while it is focused or open.
// Controlled like any input — `value` and `onValueChange` — so it drops into a
// form library's field; the trigger takes id, aria-invalid and onBlur for the
// label and errors.

const defaultFormat = (date: Date) => date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

function DatePicker({
  value,
  onValueChange,
  placeholder = 'Pick a date',
  format = defaultFormat,
  disabled,
  className,
  calendar,
  ...props
}: Omit<React.ComponentProps<'button'>, 'value' | 'defaultValue' | 'onChange'> & {
  value?: Date | undefined;
  onValueChange?: (date: Date | undefined) => void;
  placeholder?: string;
  format?: (date: Date) => string;
  /** extra props for the calendar: disabled days, month range, locale… */
  calendar?: Omit<React.ComponentProps<typeof Calendar>, 'mode' | 'selected' | 'onSelect'>;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        data-slot="date-picker"
        data-placeholder={value ? undefined : ''}
        disabled={disabled}
        className={cn(
          "flex h-10 w-56 items-center justify-between gap-2 rounded-none border-2 border-input bg-sign px-3 text-sm whitespace-nowrap text-sign-foreground [color-scheme:dark] transition-colors outline-none hover:border-muted-foreground focus-visible:border-sign-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid disabled:cursor-not-allowed disabled:opacity-40 aria-invalid:border-error data-placeholder:text-sign-foreground/60 data-popup-open:border-sign-foreground [&_svg:not([class*='size-'])]:size-4",
          className,
        )}
        {...props}
      >
        <span className="truncate">{value ? format(value) : placeholder}</span>
        <CalendarIcon className="shrink-0 text-sign-foreground" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          {...calendar}
          mode="single"
          selected={value}
          defaultMonth={value ?? calendar?.defaultMonth}
          onSelect={(date) => {
            onValueChange?.(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker };
