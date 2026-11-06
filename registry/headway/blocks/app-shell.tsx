'use client';

import { useEffect, useId, useState, type ComponentType, type ReactNode } from 'react';
import { ChevronsLeft, ChevronsRight, Menu, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { RouteBullet } from '@/components/ui/route-bullet';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// The staff app's frame, in Headway's look: a black sign column down the
// left with the white rule at its top, the app's name as a bold wordmark
// (with route bullets or a caption beside and under it), and the navigation
// grouped by the kind of work rather than a crowded top bar. The current page
// carries a heavy white bar on its left edge and white type; counts sit in
// solid white squares. The page itself stays on the ground (charcoal, or the
// white wall in light mode), under a top bar for your own things (search, the
// signed-in person).
//
// The column collapses to an icon rail (remembered per browser) showing the
// wordmark's first letter in a square, or the first route bullet, with each
// icon naming itself in a tooltip; on a phone it's a drawer. The nav is data:
// hide what this person shouldn't be offered with `hidden`, and a section
// with nothing left in it disappears. No auth logic lives in here.
//
// Router-agnostic: links render as <a> unless you pass `renderLink` — e.g.
//   renderLink={({ href, children, ...props }) => <Link to={href} {...props}>{children}</Link>}

export type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  /** a count to show beside the label (e.g. open incidents); hidden when 0 or missing */
  badge?: number;
  /** what the count means, for screen readers (e.g. "3 open"); default the number */
  badgeLabel?: string;
  /** leave it out of the nav (the caller decides: not enabled, not an admin…) */
  hidden?: boolean;
  /** active only on this exact href, not on pages under it */
  exact?: boolean;
  /** extra attributes for the link (data-*, aria-*) */
  attrs?: Record<string, string>;
};
export type NavSection = { title: string; items: NavItem[] };

export type AppShellLinkProps = {
  href: string;
  className: string;
  /** "page" on the current page's link */
  'aria-current'?: 'page' | undefined;
  onClick?: (() => void) | undefined;
  children: ReactNode;
  attrs?: Record<string, string> | undefined;
};

const defaultLink = ({ href, className, onClick, children, attrs, ...rest }: AppShellLinkProps) => (
  <a href={href} className={className} onClick={onClick} aria-current={rest['aria-current']} {...attrs}>
    {children}
  </a>
);

/** whether `item` is the current page: an exact match, or a page under it unless `exact` */
export function isNavItemActive(item: Pick<NavItem, 'href' | 'exact'>, activeHref: string | undefined) {
  if (!activeHref) return false;
  if (activeHref === item.href) return true;
  if (item.exact) return false;
  const base = item.href.endsWith('/') ? item.href : `${item.href}/`;
  return activeHref.startsWith(base);
}

const visible = (sections: NavSection[]) =>
  sections.map((s) => ({ ...s, items: s.items.filter((i) => !i.hidden) })).filter((s) => s.items.length > 0);

const DEFAULT_STORAGE_KEY = 'headway.sidebar.collapsed';

// inset, so the column's scroller doesn't clip it; yellow on the black column
const sidebarFocus =
  'outline-none focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-solid focus-visible:outline-ring';

const countText = (n: number) => (n > 99 ? '99+' : String(n));

type Brand = {
  /** where the wordmark goes; default "/" */
  href?: string;
  /** the wordmark, and the link's name; default "Headway" */
  name?: string;
  /** a line under the wordmark, e.g. the division's name */
  caption?: ReactNode;
  /** route bullets beside the wordmark (e.g. ["A", "C", "E"]); the rail shows the first */
  routes?: string[];
};

function SidebarBrand({ brand, narrow, close }: { brand: Brand; narrow: boolean; close?: ReactNode }) {
  const name = brand.name ?? 'Headway';
  const routes = brand.routes ?? [];
  return (
    <div className={cn('flex min-h-18 shrink-0 items-center gap-2 border-b border-border px-5 pt-5 pb-3', narrow && 'justify-center px-0')}>
      {/* named by its content (the wordmark, then the caption), so the visible caption is in the name */}
      <a href={brand.href ?? '/'} className={cn('flex min-w-0 flex-col gap-1 text-foreground', sidebarFocus)}>
        {narrow ? (
          <>
            {routes[0] ? (
              <RouteBullet route={routes[0]} aria-hidden />
            ) : (
              <span aria-hidden className="flex size-9 items-center justify-center bg-primary text-xl font-bold text-primary-foreground">
                {name.charAt(0).toUpperCase()}
              </span>
            )}
            <span className="sr-only">{name}</span>
          </>
        ) : (
          <>
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-xl leading-tight font-bold tracking-tight">{name}</span>
              {routes.length > 0 && (
                <span aria-hidden className="flex shrink-0 items-center gap-1">
                  {routes.map((r) => (
                    <RouteBullet key={r} route={r} size="sm" aria-hidden />
                  ))}
                </span>
              )}
            </span>
            {brand.caption && <span className="truncate text-xs text-muted-foreground">{brand.caption}</span>}
          </>
        )}
      </a>
      {close}
    </div>
  );
}

export function AppShell({
  sections,
  footer = [],
  activeHref,
  brand = {},
  topBar,
  sidebarFooter,
  renderLink = defaultLink,
  storageKey = DEFAULT_STORAGE_KEY,
  fullBleed = false,
  className,
  children,
}: {
  /** the nav, grouped by the kind of work */
  sections: NavSection[];
  /** links pinned to the bottom of the column (public site, API docs…) */
  footer?: NavItem[];
  /** the current page's href; an item is active on it, or on pages under it unless `exact` */
  activeHref?: string;
  brand?: Brand;
  /** the top bar's content, right of the menu button */
  topBar?: ReactNode;
  /** under the nav, e.g. the user menu's sidebar variant; a function is told whether the rail is collapsed */
  sidebarFooter?: ReactNode | ((collapsed: boolean) => ReactNode);
  renderLink?: (props: AppShellLinkProps) => ReactNode;
  /** the localStorage key that remembers the collapsed rail */
  storageKey?: string;
  /** give the page the whole width and height, without the centred column (a map, a live board) */
  fullBleed?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const mainId = `app-shell-main-${useId().replace(/:/g, '')}`;
  const [drawer, setDrawer] = useState(false);
  // read after mount, not in useState's initializer, so a server render and
  // the first client render agree
  useEffect(() => {
    try {
      // oxlint-disable-next-line react/set-state-in-effect
      setCollapsed(window.localStorage.getItem(storageKey) === '1');
    } catch {
      // no storage: start expanded
    }
  }, [storageKey]);
  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      window.localStorage.setItem(storageKey, next ? '1' : '0');
    } catch {
      // not remembered this time
    }
  };

  const shown = visible(sections);
  const shownFooter = footer.filter((i) => !i.hidden);

  const nav = (narrow: boolean, onNavigate?: () => void) => {
    const link = (item: NavItem) => {
      const active = isNavItemActive(item, activeHref);
      const count = item.badge && item.badge > 0 ? item.badge : 0;
      return renderLink({
        href: item.href,
        onClick: onNavigate,
        attrs: item.attrs,
        'aria-current': active ? 'page' : undefined,
        className: cn(
          'relative flex h-10 items-center gap-3 border-l-4 border-transparent pr-3 pl-4 text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground',
          sidebarFocus,
          active && 'border-primary text-foreground',
          narrow && 'justify-center px-0 pr-1',
        ),
        children: (
          <>
            <item.icon className="size-4 shrink-0" />
            {/* on the rail the label is only for screen readers; the tooltip shows it */}
            <span className={narrow ? 'sr-only' : 'min-w-0 flex-1 truncate'}>{item.label}</span>
            {count > 0 && (
              <>
                {/* read as "Incidents, 3 open"; the square is only for the eye */}
                <span className="sr-only">, {item.badgeLabel ?? countText(count)}</span>
                {narrow ? (
                  <span aria-hidden className="absolute top-1.5 right-2.5 size-2 rounded-full bg-primary" />
                ) : (
                  <span
                    aria-hidden
                    data-slot="app-shell-badge"
                    className="flex h-5 min-w-5 items-center justify-center bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums"
                  >
                    {countText(count)}
                  </span>
                )}
              </>
            )}
          </>
        ),
      });
    };
    // on the rail each icon names itself in a tooltip, on hover or focus
    const row = (item: NavItem) =>
      narrow ? (
        <Tooltip key={item.href}>
          <TooltipTrigger render={<div />}>{link(item)}</TooltipTrigger>
          <TooltipContent side="right">
            {item.label}
            {item.badge ? ` · ${countText(item.badge)}` : null}
          </TooltipContent>
        </Tooltip>
      ) : (
        <div key={item.href}>{link(item)}</div>
      );
    return (
      <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto py-5">
        {shown.map((section) => (
          <div key={section.title} role="group" aria-label={section.title} className="space-y-0.5">
            {narrow ? (
              <div aria-hidden className="mx-4 mb-2 h-px bg-border first:hidden" />
            ) : (
              <div aria-hidden className="px-5 pb-2 text-xs font-bold text-muted-foreground">
                {section.title}
              </div>
            )}
            {section.items.map(row)}
          </div>
        ))}
        {shownFooter.length > 0 && <div className="mt-auto space-y-0.5 border-t border-border pt-4">{shownFooter.map(row)}</div>}
      </nav>
    );
  };
  // the slot under the nav (the signed-in person's menu): told whether the rail is collapsed
  const footerSlot = (narrow: boolean) => {
    const content = typeof sidebarFooter === 'function' ? sidebarFooter(narrow) : sidebarFooter;
    return content ? (
      <div data-slot="app-shell-sidebar-footer" className={cn('border-t border-border py-3', narrow ? 'px-2' : 'px-3')}>
        {content}
      </div>
    ) : null;
  };

  return (
    <TooltipProvider>
      <div data-slot="app-shell" className={cn('flex min-h-screen bg-background text-foreground', className)}>
        {/* the first stop for the keyboard: past the column to the page (WCAG 2.4.1) */}
        <a
          href={`#${mainId}`}
          // focus by hand: a hash router would read the href as a route
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(mainId)?.focus();
          }}
          data-slot="app-shell-skip-link"
          className="sr-only z-50 bg-primary px-4 py-3 font-bold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-3 focus:outline-offset-2 focus:outline-solid focus:outline-ring"
        >
          Skip to content
        </a>
        <aside
          data-slot="app-shell-sidebar"
          data-collapsed={collapsed || undefined}
          className={cn(
            // the sign column: black, with the white rule just inside its top edge
            'on-sign sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-sign text-foreground transition-[width] duration-150 before:absolute before:inset-x-0 before:top-1.5 before:h-0.5 before:bg-sign-rule md:flex print:hidden',
            collapsed ? 'w-16' : 'w-60',
          )}
        >
          <SidebarBrand brand={brand} narrow={collapsed} />
          {nav(collapsed)}
          {footerSlot(collapsed)}
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'flex h-12 shrink-0 items-center justify-center gap-2 border-t border-border text-sm font-bold text-muted-foreground hover:bg-accent hover:text-foreground',
              sidebarFocus,
            )}
            aria-label={collapsed ? 'Expand the sidebar' : 'Collapse the sidebar'}
          >
            {collapsed ? (
              <ChevronsRight className="size-4" />
            ) : (
              <>
                <ChevronsLeft className="size-4" /> Collapse
              </>
            )}
          </button>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <header
            data-slot="app-shell-top-bar"
            className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background px-4 md:px-6 print:hidden"
          >
            <Sheet open={drawer} onOpenChange={setDrawer}>
              <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" aria-label="Open navigation" />}>
                <Menu />
              </SheetTrigger>
              <SheetContent side="left" showCloseButton={false} className="w-72 gap-0 bg-sign p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SidebarBrand
                  brand={brand}
                  narrow={false}
                  close={
                    <SheetClose
                      aria-label="Close navigation"
                      className={cn(
                        'ml-auto flex size-10 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground',
                        sidebarFocus,
                      )}
                    >
                      <XIcon className="size-4" />
                    </SheetClose>
                  }
                />
                {nav(false, () => setDrawer(false))}
                {footerSlot(false)}
              </SheetContent>
            </Sheet>
            {topBar}
          </header>
          <main
            id={mainId}
            tabIndex={-1}
            data-slot="app-shell-main"
            className={cn(
              'outline-none',
              fullBleed ? 'flex min-h-0 w-full flex-1 flex-col' : 'mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6',
            )}
          >
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
