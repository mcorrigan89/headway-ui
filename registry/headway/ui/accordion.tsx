'use client';

import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { MinusIcon, PlusIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// Stacked sections that open and close: bold headings between heavy rules, a
// plus that turns to a minus when open. `multiple` lets several stay open at
// once.

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn('flex w-full flex-col', className)} {...props} />;
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn('border-b-2 border-foreground', className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex flex-1 items-center justify-between gap-3 py-4 text-left text-base font-bold tracking-tight text-foreground decoration-2 underline-offset-4 outline-none hover:underline focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring aria-disabled:pointer-events-none aria-disabled:opacity-40',
          className,
        )}
        {...props}
      >
        {children}
        <PlusIcon
          data-slot="accordion-trigger-icon"
          strokeWidth={3}
          className="pointer-events-none size-4 shrink-0 group-aria-expanded/accordion-trigger:hidden"
        />
        <MinusIcon
          data-slot="accordion-trigger-icon"
          strokeWidth={3}
          className="pointer-events-none hidden size-4 shrink-0 group-aria-expanded/accordion-trigger:inline"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm text-foreground data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          'h-(--accordion-panel-height) pt-0 pb-4 data-ending-style:h-0 data-starting-style:h-0 [&_a]:font-bold [&_a]:underline [&_a]:decoration-2 [&_a]:underline-offset-4 [&_a:hover]:decoration-ring [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
