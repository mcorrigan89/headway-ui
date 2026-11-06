'use client';

import * as React from 'react';
import { ChevronDownIcon, FileQuestionIcon, HouseIcon, RotateCwIcon, TriangleAlertIcon } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Sign, SignTitle } from '@/components/ui/sign';
import { cn } from '@/lib/utils';

// What a page shows when it breaks, or when there's nothing at the address:
// said in words a rider can act on, with a way back (try again, go back, go
// home). A station sign names the kind of problem — a black band under the
// white rule reading "404 · Not found", with the icon on a red tile for an
// error or a white one for a missing page — and the title is large bold type.
// The technical message is folded away under "Technical details", for
// whoever is fixing it, with a reference to quote to support.
//
//   <ErrorPage error={error} onRetry={reset} homeHref="/" />
//   <ErrorPage variant="not-found" homeHref="/" />

type ErrorPageVariant = 'error' | 'not-found';

const DEFAULTS: Record<ErrorPageVariant, { eyebrow: string; title: string; description: string }> = {
  error: {
    eyebrow: 'Something went wrong',
    title: 'This page ran into a problem',
    description: 'It’s not something you did. Try again, or go back to where you were. If it keeps happening, let us know.',
  },
  'not-found': {
    eyebrow: '404 · Not found',
    title: 'We couldn’t find that page',
    description: 'The link may be out of date, or the page may have moved. Check the address, or start again from home.',
  },
};

/** the message of whatever was thrown, if it has one */
function errorMessage(error: unknown): string | null {
  if (error == null) return null;
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

type ErrorPageProps = Omit<React.ComponentProps<'div'>, 'title'> & {
  variant?: ErrorPageVariant;
  /** what was thrown; its message goes under "Technical details" */
  error?: unknown;
  /** also show the stack trace in the details (for staff and development) */
  showStack?: boolean;
  /** a reference to quote to support (a request or error id) */
  reference?: string;
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** shows "Try again" */
  onRetry?: () => void;
  /** shows "Go back" */
  onBack?: () => void;
  /** shows "Go to home" as a link; default "/" — null hides it */
  homeHref?: string | null;
  homeLabel?: string;
  /** more actions after the built-in ones */
  actions?: React.ReactNode;
};

function ErrorPage({
  variant = 'error',
  error,
  showStack = false,
  reference,
  eyebrow,
  title,
  description,
  onRetry,
  onBack,
  homeHref = '/',
  homeLabel = 'Go to home',
  actions,
  className,
  ...props
}: ErrorPageProps) {
  const d = DEFAULTS[variant];
  const message = errorMessage(error);
  const stack = showStack && error instanceof Error ? error.stack : undefined;
  const hasDetails = Boolean(message || stack || reference);
  const titleId = React.useId();
  const Icon = variant === 'not-found' ? FileQuestionIcon : TriangleAlertIcon;

  return (
    <div
      data-slot="error-page"
      data-variant={variant}
      role={variant === 'error' ? 'alert' : undefined}
      aria-labelledby={titleId}
      className={cn('mx-auto flex w-full max-w-xl flex-col items-start gap-8 px-4 py-16 md:py-24', className)}
      {...props}
    >
      <Sign size="default" className="w-fit max-w-full">
        <div
          aria-hidden
          className={cn(
            'flex size-10 shrink-0 items-center justify-center [&_svg]:size-6',
            variant === 'error' ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground',
          )}
        >
          <Icon />
        </div>
        <SignTitle data-slot="error-page-eyebrow" className="whitespace-normal">
          {eyebrow ?? d.eyebrow}
        </SignTitle>
      </Sign>
      <div className="flex flex-col gap-3">
        <h1 id={titleId} data-slot="error-page-title" className="text-4xl leading-tight font-bold tracking-tight text-balance md:text-5xl">
          {title ?? d.title}
        </h1>
        <p data-slot="error-page-description" className="text-lg text-muted-foreground">
          {description ?? d.description}
        </p>
      </div>
      {(onRetry || onBack || homeHref || actions) && (
        <div data-slot="error-page-actions" className="flex flex-wrap gap-3">
          {onRetry && (
            <Button onClick={onRetry}>
              <RotateCwIcon data-icon="inline-start" />
              Try again
            </Button>
          )}
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Go back
            </Button>
          )}
          {homeHref && (
            <a href={homeHref} className={buttonVariants({ variant: onRetry ? 'ghost' : 'default' })}>
              <HouseIcon data-icon="inline-start" />
              {homeLabel}
            </a>
          )}
          {actions}
        </div>
      )}
      {hasDetails && (
        <Collapsible className="w-full border-t border-border pt-4">
          <CollapsibleTrigger className="group/details flex items-center gap-2 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:outline-ring">
            <ChevronDownIcon aria-hidden className="size-4 transition-transform group-data-[panel-open]/details:rotate-180" />
            Technical details
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            {reference && (
              <p className="mb-2 text-sm text-muted-foreground">
                Reference: <span className="font-mono text-foreground select-all">{reference}</span>
              </p>
            )}
            {(message || stack) && (
              <pre
                data-slot="error-page-details"
                className="on-sign max-h-64 overflow-auto border border-border bg-card p-3 font-mono text-xs whitespace-pre-wrap text-foreground"
              >
                {stack ?? message}
              </pre>
            )}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

export { ErrorPage, errorMessage, type ErrorPageVariant };
