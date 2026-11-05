'use client';

import * as React from 'react';
import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// A number in a square black box, like <Input>, in either mode: a grey edge
// that lightens on hover and turns white on focus, with the focus ring
// outside the whole box. A unit sits inside it — "$" before, "min" after —
// in bold muted type, and a pair of square steppers on the right edge, split
// off by a grey rule, nudge the value by `step`. ArrowUp/ArrowDown do the
// same (Shift for `largeStep`); the value is clamped to min/max when the
// field loses focus, and an empty box is a null value, not 0. Built on Base
// UI's NumberField.

function NumberInput({
  className,
  value,
  defaultValue,
  onValueChange,
  precision,
  format,
  prefix,
  suffix,
  placeholder,
  hideSteppers = false,
  inputClassName,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  'aria-required': ariaRequired,
  onBlur,
  onFocus,
  ...props
}: Omit<NumberFieldPrimitive.Root.Props, 'value' | 'defaultValue' | 'onValueChange' | 'onBlur' | 'onFocus' | 'prefix'> & {
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null, details: NumberFieldPrimitive.Root.ChangeEventDetails) => void;
  /** fraction digits to show and keep: 0 for whole numbers, 2 for money */
  precision?: number;
  /** a unit or symbol before the number, e.g. "$" */
  prefix?: React.ReactNode;
  /** a unit after the number, e.g. "sq ft" or "%" */
  suffix?: React.ReactNode;
  placeholder?: string;
  hideSteppers?: boolean;
  inputClassName?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: React.AriaAttributes['aria-invalid'];
  'aria-required'?: React.AriaAttributes['aria-required'];
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
}) {
  const numberFormat = React.useMemo<Intl.NumberFormatOptions | undefined>(
    () => (precision === undefined ? format : { minimumFractionDigits: precision, maximumFractionDigits: precision, ...format }),
    [precision, format],
  );

  return (
    <NumberFieldPrimitive.Root
      data-slot="number-input"
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      format={numberFormat}
      className={cn('w-full', className)}
      {...props}
    >
      <NumberFieldPrimitive.Group
        data-slot="number-input-group"
        className={cn(
          'group/number-input on-sign relative flex h-10 w-full min-w-0 items-stretch rounded-none border-2 border-input bg-sign text-base text-sign-foreground [color-scheme:dark] transition-colors hover:border-muted-foreground has-[input:focus-visible]:border-foreground has-[input:focus-visible]:outline-3 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-ring has-[[aria-invalid=true]]:border-error data-disabled:cursor-not-allowed data-disabled:opacity-40 md:text-sm',
        )}
      >
        {prefix != null && (
          <span
            data-slot="number-input-prefix"
            className="flex shrink-0 items-center pl-3 text-sm font-bold text-muted-foreground select-none"
          >
            {prefix}
          </span>
        )}
        <NumberFieldPrimitive.Input
          data-slot="number-input-input"
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          onBlur={onBlur}
          onFocus={onFocus}
          className={cn(
            'h-full w-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-base text-sign-foreground tabular-nums outline-none placeholder:text-sign-foreground/60 disabled:cursor-not-allowed md:text-sm',
            prefix != null && 'pl-2',
            suffix != null && 'pr-2',
            inputClassName,
          )}
        />
        {suffix != null && (
          <span
            data-slot="number-input-suffix"
            className="flex shrink-0 items-center pr-3 text-sm font-bold text-muted-foreground select-none"
          >
            {suffix}
          </span>
        )}
        {!hideSteppers && (
          <span data-slot="number-input-steppers" className="flex w-8 shrink-0 flex-col border-l-2 border-input">
            <NumberFieldPrimitive.Increment aria-label="Increase" className={stepperClassName}>
              <ChevronUpIcon />
            </NumberFieldPrimitive.Increment>
            <NumberFieldPrimitive.Decrement aria-label="Decrease" className={cn(stepperClassName, 'border-t-2 border-input')}>
              <ChevronDownIcon />
            </NumberFieldPrimitive.Decrement>
          </span>
        )}
      </NumberFieldPrimitive.Group>
    </NumberFieldPrimitive.Root>
  );
}

// the steppers are bare until hovered, then a grey band; at a limit they fade like any disabled control
const stepperClassName =
  "flex flex-1 items-center justify-center rounded-none text-sign-foreground outline-none select-none hover:bg-accent focus-visible:bg-accent disabled:pointer-events-none disabled:opacity-40 data-disabled:pointer-events-none data-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-3.5";

export { NumberInput };
