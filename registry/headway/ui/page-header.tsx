import * as React from 'react';
import { Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { cn } from '@/lib/utils';

// The top of a page, set like the name on a station sign: an optional small
// bold label above (or route bullets, if you pass them), then the title in
// bold at text-4xl with tight tracking, a count on an outlined badge beside
// it, a line of muted text under it. To the right, a search box (a black
// input group) and the page's actions; on a narrow screen they wrap
// underneath and the search takes the full width. It never prints alone at
// the foot of a page.
//
//   <PageHeader eyebrow="Service changes" title="Planned work" count={128}
//     search={query} onSearchChange={setQuery} actions={<Button>New notice</Button>} />

type PageHeaderProps = Omit<React.ComponentProps<'header'>, 'title'> & {
  /** a short label above the title: a string is set as a small bold label; pass route bullets or any node to show those instead */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  /** the heading level (default h1) */
  titleAs?: 'h1' | 'h2';
  subtitle?: React.ReactNode;
  /** how many there are, beside the title (shown only with a title) */
  count?: number;
  /** the search box's value; the box shows when `onSearchChange` is given */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** names the search box for screen readers (default: the placeholder) */
  searchLabel?: string;
  searchRef?: React.Ref<HTMLInputElement>;
  /** buttons and menus, at the right */
  actions?: React.ReactNode;
};

function PageHeader({
  eyebrow,
  title,
  titleAs: Title = 'h1',
  subtitle,
  count,
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search',
  searchLabel,
  searchRef,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-4 print:break-after-avoid', className)}
      {...props}
    >
      {(eyebrow || title || subtitle) && (
        <div data-slot="page-header-heading" className="flex min-w-0 flex-col items-start gap-3">
          {eyebrow &&
            (typeof eyebrow === 'string' ? (
              <p data-slot="page-header-eyebrow" className="text-sm leading-none font-bold text-muted-foreground">
                {eyebrow}
              </p>
            ) : (
              <div data-slot="page-header-eyebrow" className="flex flex-wrap items-center gap-1.5">
                {eyebrow}
              </div>
            ))}
          {title && (
            <div className="flex flex-wrap items-center gap-3">
              <Title data-slot="page-header-title" className="text-4xl leading-tight font-bold tracking-tight text-foreground">
                {title}
              </Title>
              {count != null && (
                <Badge data-slot="page-header-count" variant="outline" className="text-sm tabular-nums">
                  {count.toLocaleString()}
                </Badge>
              )}
            </div>
          )}
          {subtitle && (
            <div data-slot="page-header-subtitle" className="max-w-prose text-base text-muted-foreground">
              {subtitle}
            </div>
          )}
        </div>
      )}
      {(onSearchChange || actions) && (
        <div data-slot="page-header-actions" className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          {onSearchChange && (
            <InputGroup data-slot="page-header-search" className="w-full sm:w-64">
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchRef}
                type="search"
                aria-label={searchLabel ?? searchPlaceholder}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape' && search) {
                    e.preventDefault();
                    onSearchChange('');
                  }
                }}
                className="[&::-webkit-search-cancel-button]:appearance-none"
              />
              {search && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={() => onSearchChange('')}>
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
          )}
          {actions}
        </div>
      )}
    </header>
  );
}

type PageSectionProps = Omit<React.ComponentProps<'section'>, 'title'> & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** buttons beside the section title */
  actions?: React.ReactNode;
};

/** A titled section of a page: a black panel with a hairline edge and a bold text-2xl title. */
function PageSection({ title, description, actions, className, children, ...props }: PageSectionProps) {
  const titleId = React.useId();
  return (
    <section
      data-slot="page-section"
      aria-labelledby={title ? titleId : undefined}
      className={cn('on-sign flex flex-col gap-4 border border-border bg-card p-6 text-card-foreground', className)}
      {...props}
    >
      {(title || actions) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            {title && (
              <h2 id={titleId} className="text-2xl leading-tight font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export { PageHeader, PageSection };
