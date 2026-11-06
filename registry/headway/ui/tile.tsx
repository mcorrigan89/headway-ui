'use client';

import * as React from 'react';
import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

// A card you click: a black panel (the same in both modes) with an icon on a
// small square of solid colour, a bold title and one line of description. It
// turns grey (accent) on hover. A selected tile gets a white `primary` edge
// and a thick white rail down its left side — an edge, never a tint. It is a
// button by default; give it `href` for a link, or `render` for a router link
// (`render={<RouterLink to="/fares" />}`).
//
//   <Tile icon={<TrainFront />} title="Plan a trip" description="Subway, bus and rail, step-free if you need it" />

const tileIconVariants = cva(
  "flex size-10 shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      tone: {
        // white on the black panel: the main thing
        hope: 'bg-primary text-primary-foreground',
        sky: 'bg-info text-info-foreground',
        field: 'bg-ok text-ok-foreground',
        ash: 'bg-muted text-foreground',
      },
    },
    defaultVariants: { tone: 'hope' },
  },
);

type TileProps = Omit<useRender.ComponentProps<'button'>, 'title'> &
  VariantProps<typeof tileIconVariants> & {
    /** a lucide icon or similar, shown on a square of the tone's colour */
    icon?: React.ReactNode;
    title: React.ReactNode;
    /** one line; longer text is cut with an ellipsis */
    description?: React.ReactNode;
    /** a link instead of a button */
    href?: string;
    target?: string;
    rel?: string;
    selected?: boolean;
    disabled?: boolean;
  };

function Tile({
  icon,
  title,
  description,
  tone,
  selected,
  disabled = false,
  href,
  target,
  rel,
  render,
  className,
  children,
  onClick,
  ...props
}: TileProps) {
  const isButton = !href && !render;
  const content = (
    <>
      {icon && (
        <span aria-hidden data-slot="tile-icon" className={tileIconVariants({ tone })}>
          {icon}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span data-slot="tile-title" className="text-lg leading-tight font-bold tracking-tight text-foreground">
          {title}
        </span>
        {description && (
          <span data-slot="tile-description" className="truncate text-sm text-muted-foreground">
            {description}
          </span>
        )}
        {children}
      </span>
    </>
  );
  const ownProps: Record<string, unknown> = {
    'data-slot': 'tile',
    'data-selected': selected ? '' : undefined,
    'data-disabled': disabled ? '' : undefined,
    className: cn(
      'group/tile on-sign relative flex w-full items-start gap-4 rounded-none border border-border bg-card p-5 text-left text-card-foreground transition-colors outline-none hover:bg-accent focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring',
      'data-selected:border-primary data-selected:before:absolute data-selected:before:inset-y-[-1px] data-selected:before:left-[-1px] data-selected:before:w-1.5 data-selected:before:bg-primary',
      'data-disabled:pointer-events-none data-disabled:opacity-40',
      className,
    ),
    children: content,
  };
  if (isButton) {
    ownProps.type = 'button';
    ownProps.disabled = disabled;
    // a selectable tile says whether it is selected
    if (selected !== undefined) ownProps['aria-pressed'] = selected;
    ownProps.onClick = onClick;
  } else {
    if (href !== undefined) ownProps.href = disabled ? undefined : href;
    ownProps.target = target;
    ownProps.rel = rel ?? (target === '_blank' ? 'noreferrer' : undefined);
    if (selected) ownProps['aria-current'] = 'page';
    if (disabled) {
      ownProps['aria-disabled'] = true;
      ownProps.tabIndex = -1;
    }
    ownProps.onClick = (event: React.MouseEvent<HTMLElement>) => {
      if (disabled) return event.preventDefault();
      onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    };
  }
  return useRender({
    defaultTagName: isButton ? 'button' : 'a',
    render,
    props: mergeProps<'button'>(ownProps as React.ComponentProps<'button'>, props),
  });
}

export { Tile, tileIconVariants };
