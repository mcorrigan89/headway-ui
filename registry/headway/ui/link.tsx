import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { ArrowUpRight } from 'lucide-react';

import { cn } from '@/lib/utils';

// A text link, as the signs would set one: in the text colour with a heavy
// 2px underline below the baseline that doubles to 4px on hover — no blue,
// no colour change. `muted` starts in the muted grey and goes to the text
// colour. An external link opens in a new tab, with a small arrow and a
// spoken "(opens in a new tab)". Render it as a router link with
// `render={<RouterLink to="/alerts" />}`, or as a button that looks like a
// link with `render={<button type="button" />}`.
//
//   <Link href="https://new.mta.info" external>MTA</Link>

const linkVariants = cva(
  'inline cursor-pointer rounded-none underline decoration-2 underline-offset-4 outline-none hover:decoration-4 focus-visible:decoration-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring aria-disabled:cursor-not-allowed aria-disabled:no-underline aria-disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40 [&_svg]:inline [&_svg]:size-[0.9em] [&_svg]:align-[-0.1em]',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        muted: 'text-muted-foreground hover:text-foreground',
      },
      size: {
        inherit: '',
        sm: 'text-sm',
        xs: 'text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'inherit' },
  },
);

type LinkProps = useRender.ComponentProps<'a'> &
  VariantProps<typeof linkVariants> & {
    /** opens in a new tab with an arrow icon */
    external?: boolean;
    /** open in a new tab without the external arrow (e.g. a printable page in the app) */
    openInNewTab?: boolean;
    disabled?: boolean;
  };

function Link({
  className,
  variant,
  size,
  external = false,
  openInNewTab = false,
  disabled = false,
  render,
  children,
  href,
  onClick,
  ...props
}: LinkProps) {
  const newTab = external || openInNewTab;
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(linkVariants({ variant, size }), className),
        href: disabled ? undefined : href,
        target: newTab ? '_blank' : undefined,
        rel: newTab ? 'noreferrer' : undefined,
        'aria-disabled': disabled || undefined,
        tabIndex: disabled ? -1 : undefined,
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) return event.preventDefault();
          onClick?.(event);
        },
        children: (
          <>
            {children}
            {newTab && <span className="sr-only"> (opens in a new tab)</span>}
            {external && (
              <>
                {' '}
                <ArrowUpRight aria-hidden data-slot="link-external-icon" />
              </>
            )}
          </>
        ),
      },
      { ...props, 'data-slot': 'link' } as React.ComponentProps<'a'>,
    ),
  });
}

export { Link, linkVariants };
