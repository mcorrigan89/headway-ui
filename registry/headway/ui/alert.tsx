import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// A notice in the page, laid out like a service-status entry: an icon on a
// tile of its status colour, a bold title (route bullets welcome) and the
// details. The tile, not a tinted icon, carries the colour, so the darker
// colours still read on a dark ground.

const alertVariants = cva(
  'relative grid w-full gap-1 border border-border bg-card px-4 py-3.5 text-left text-sm has-data-[slot=alert-action]:pr-24 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3.5 *:[svg]:row-span-2 *:[svg]:box-content *:[svg]:size-5 *:[svg]:p-1.5',
  {
    variants: {
      variant: {
        default: '*:[svg]:bg-primary *:[svg]:text-primary-foreground',
        ok: 'border-l-4 border-l-ok *:[svg]:bg-ok *:[svg]:text-ok-foreground',
        warning: 'border-l-4 border-l-warning *:[svg]:bg-warning *:[svg]:text-warning-foreground',
        destructive: 'border-l-4 border-l-destructive *:[svg]:bg-destructive *:[svg]:text-destructive-foreground',
        info: 'border-l-4 border-l-info *:[svg]:bg-info *:[svg]:text-info-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Alert({ className, variant, ...props }: React.ComponentProps<'div'> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant ?? 'default'}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-title"
      className={cn('flex min-h-8 flex-wrap items-center gap-x-2 gap-y-1 text-base leading-tight font-bold tracking-tight', className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        'text-sm text-muted-foreground [&_p:not(:last-child)]:mb-2 [&_a]:underline [&_a]:underline-offset-3 [&_a:hover]:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="alert-action" className={cn('absolute top-3.5 right-3.5', className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants };
