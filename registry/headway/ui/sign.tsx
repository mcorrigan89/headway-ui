import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// The sign band: white type on black under a thin white rule, with room for
// route bullets and an arrow beside the words. Put <RouteBullet>s and an
// <Arrow> straight inside; <SignContent> takes the space between them.
//
//   <Sign>
//     <Arrow direction="left" />
//     <SignContent>
//       <SignTitle>Downtown &amp; Brooklyn</SignTitle>
//       <SignDescription>Local and express</SignDescription>
//     </SignContent>
//     <RouteBullet route="4" /> <RouteBullet route="5" />
//   </Sign>

const signVariants = cva('sign flex w-full items-center [&>[data-slot=arrow]]:h-[1.25em] [&>[data-slot=arrow]]:w-[1.25em]', {
  variants: {
    size: {
      sm: 'gap-2 px-3 pb-2 text-base',
      default: 'gap-3 px-4 pb-3 text-2xl',
      lg: 'gap-4 px-6 pb-5 text-4xl',
    },
    rule: {
      true: 'sign-rule',
      false: 'pt-3',
    },
  },
  defaultVariants: { size: 'default', rule: true },
});

function Sign({ className, size, rule, ...props }: React.ComponentProps<'div'> & VariantProps<typeof signVariants>) {
  return <div data-slot="sign" data-size={size ?? 'default'} className={cn(signVariants({ size, rule }), className)} {...props} />;
}

function SignContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sign-content" className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)} {...props} />;
}

function SignTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sign-title" className={cn('truncate', className)} {...props} />;
}

function SignDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sign-description"
      className={cn('text-[0.55em] font-medium tracking-normal text-sign-foreground/80', className)}
      {...props}
    />
  );
}

// bullets kept together, in a tight row
function SignRoutes({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="sign-routes" className={cn('flex shrink-0 items-center gap-1', className)} {...props} />;
}

export { Sign, SignContent, SignTitle, SignDescription, SignRoutes, signVariants };
