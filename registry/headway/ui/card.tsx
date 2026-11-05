import { cn } from '@/lib/utils';

// A black panel on the light wall, a charcoal one on the dark ground. Its header is plain by default; variant="sign" makes it a
// black sign band with the white rule.

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'on-sign flex flex-col gap-5 border border-border bg-card pb-5 text-card-foreground has-[>[data-slot=card-footer]]:pb-0',
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, variant = 'default', ...props }: React.ComponentProps<'div'> & { variant?: 'default' | 'sign' }) {
  return (
    <div
      data-slot="card-header"
      data-variant={variant}
      className={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-5 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        variant === 'sign' ? 'sign sign-rule -m-px pb-4' : 'pt-5',
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('text-lg leading-tight font-bold tracking-tight', className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        'text-sm font-normal text-muted-foreground in-data-[variant=sign]:text-sign-foreground/80 in-data-[variant=sign]:tracking-normal',
        className,
      )}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot="card-action" className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-5 text-sm', className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center gap-2 border-t border-border px-5 py-4', className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
