'use client';

import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// Tabs on a sign band: the list is black and the chosen tab is lit white.
// variant="line" is the quieter one: a heavy bar under the chosen tab.

function Tabs({ className, orientation = 'horizontal', ...props }: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn('group/tabs flex gap-3 data-horizontal:flex-col', className)}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  'group/tabs-list inline-flex w-fit items-center justify-center rounded-none text-sign-foreground group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:items-stretch',
  {
    variants: {
      variant: {
        default: 'bg-sign p-1 group-data-horizontal/tabs:h-11',
        line: 'gap-4 border-border text-muted-foreground group-data-horizontal/tabs:h-10 group-data-horizontal/tabs:border-b group-data-vertical/tabs:gap-1 group-data-vertical/tabs:border-l',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function TabsList({ className, variant = 'default', ...props }: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List data-slot="tabs-list" data-variant={variant} className={cn(tabsListVariants({ variant }), className)} {...props} />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full items-center justify-center gap-2 rounded-none px-3 text-sm font-bold whitespace-nowrap transition-colors outline-none group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-2 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // on the band: dim until chosen, then a white panel
        'group-data-[variant=default]/tabs-list:text-sign-foreground/70 group-data-[variant=default]/tabs-list:hover:text-sign-foreground group-data-[variant=default]/tabs-list:data-active:bg-primary group-data-[variant=default]/tabs-list:data-active:text-primary-foreground',
        // line: a 4px bar under (or beside) the chosen tab
        'group-data-[variant=line]/tabs-list:px-0 group-data-[variant=line]/tabs-list:hover:text-foreground group-data-[variant=line]/tabs-list:data-active:text-foreground group-data-vertical/tabs:group-data-[variant=line]/tabs-list:px-3',
        'after:absolute after:bg-foreground after:opacity-0 group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-px group-data-horizontal/tabs:after:h-1 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-left-px group-data-vertical/tabs:after:w-1 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn('flex-1 text-sm outline-none', className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
