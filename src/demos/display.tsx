import { useState, type MouseEvent, type ReactNode } from 'react';
import { Accessibility, ChevronDown, MapIcon, Search, Ticket, TrainFront } from 'lucide-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle } from '@/components/ui/item';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { RouteBullet } from '@/components/ui/route-bullet';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#breadcrumb">Stations</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#breadcrumb">Manhattan</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Times Sq–42 St</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function PaginationDemo() {
  const [page, setPage] = useState(2);
  const go = (n: number) => (e: MouseEvent) => {
    e.preventDefault();
    setPage(Math.min(Math.max(n, 1), 12));
  };
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#pagination" onClick={go(page - 1)} />
        </PaginationItem>
        {[1, 2, 3].map((n) => (
          <PaginationItem key={n}>
            <PaginationLink href="#pagination" isActive={page === n} onClick={go(n)}>
              {n}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#pagination" isActive={page === 12} onClick={go(12)}>
            12
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#pagination" onClick={go(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Subway</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-72 gap-1">
              <li>
                <NavigationMenuLink href="#navigation-menu" active>
                  <TrainFront />
                  Service status
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#navigation-menu">
                  <MapIcon />
                  Subway map
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#navigation-menu">
                  <Accessibility />
                  Accessible stations
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Fares</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-64 gap-1">
              <li>
                <NavigationMenuLink href="#navigation-menu">
                  <Ticket />
                  Tap to pay
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#navigation-menu">Reduced fare</NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="#navigation-menu">Weekly fare cap</NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="#navigation-menu" className={navigationMenuTriggerStyle()}>
            Planned work
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function AccordionDemo() {
  return (
    <Accordion defaultValue={['elevators']} className="max-w-lg">
      <AccordionItem value="elevators">
        <AccordionTrigger>Are the elevators working?</AccordionTrigger>
        <AccordionContent>
          <p>All elevators at Times Sq–42 St are in service.</p>
          <p>
            Check <a href="#accordion">elevator and escalator status</a> before you travel.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="transfer">
        <AccordionTrigger>Is the transfer free?</AccordionTrigger>
        <AccordionContent>Yes: subway to bus, or bus to subway, within two hours of your first tap.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="bikes">
        <AccordionTrigger>Can I bring a bike?</AccordionTrigger>
        <AccordionContent>Bikes are allowed at all times. Use the service gate, not the turnstile.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function CollapsibleDemo() {
  return (
    <Collapsible className="flex max-w-sm flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-sm font-bold">
          <RouteBullet route="F" size="sm" />3 stops skipped tonight
        </span>
        <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Show stops" />}>
          <ChevronDown />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <ul className="flex flex-col gap-1 border-l-4 border-line-orange pl-3 text-sm">
          <li>14 St</li>
          <li>23 St</li>
          <li>57 St</li>
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function KbdDemo() {
  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="flex items-center gap-2">
        Search stations
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </p>
      <p className="flex items-center gap-2">
        Close the map <Kbd>Esc</Kbd>
      </p>
    </div>
  );
}

function SkeletonDemo() {
  return (
    <div className="flex max-w-sm items-center gap-3">
      <Skeleton className="size-7 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

function SpinnerDemo() {
  return (
    <div className="flex items-center gap-6">
      <Spinner />
      <Spinner className="size-8" />
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Finding routes…
      </span>
      <Button disabled>
        <Spinner data-icon="inline-start" />
        Loading arrivals
      </Button>
    </div>
  );
}

function EmptyDemo() {
  return (
    <Empty className="max-w-lg">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Search />
        </EmptyMedia>
        <EmptyTitle>No saved trips</EmptyTitle>
        <EmptyDescription>Save a trip to see its service status here every time you open the app.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>Plan a trip</Button>
      </EmptyContent>
    </Empty>
  );
}

function ItemDemo() {
  return (
    <ItemGroup className="max-w-md">
      <Item variant="outline">
        <ItemMedia>
          <RouteBullet route="7" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Grand Central–42 St</ItemTitle>
          <ItemDescription>Manhattan-bound trains every 4 minutes.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="sm" variant="outline">
            Save
          </Button>
        </ItemActions>
      </Item>
      {/* the link's text comes from the Item's children */}
      {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label */}
      <Item render={<a href="#item" />}>
        <ItemMedia variant="icon">
          <Accessibility />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Accessible stations</ItemTitle>
          <ItemDescription>Stations with step-free access from street to train.</ItemDescription>
        </ItemContent>
      </Item>
      <Item variant="muted" size="sm">
        <ItemContent>
          <ItemTitle>Weekly fare cap</ItemTitle>
        </ItemContent>
        <ItemActions className="text-sm font-bold tabular-nums">$34</ItemActions>
      </Item>
    </ItemGroup>
  );
}

function AvatarDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Avatar size="sm">
        <AvatarFallback>JR</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>SA</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>MT</AvatarFallback>
        <AvatarBadge className="bg-ok" />
      </Avatar>
      <AvatarGroup>
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>KB</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>RC</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
    </div>
  );
}

function AspectRatioDemo() {
  return (
    <div className="w-full max-w-sm">
      <AspectRatio ratio={16 / 9} className="on-sign flex items-end bg-sign p-3 text-sign-foreground">
        <span className="flex items-center gap-2 text-sm font-bold">
          <RouteBullet route="L" size="sm" />
          Platform camera, 1 Av
        </span>
      </AspectRatio>
    </div>
  );
}

export const DISPLAY_DEMOS: Record<string, () => ReactNode> = {
  breadcrumb: BreadcrumbDemo,
  pagination: PaginationDemo,
  'navigation-menu': NavigationMenuDemo,
  accordion: AccordionDemo,
  collapsible: CollapsibleDemo,
  kbd: KbdDemo,
  skeleton: SkeletonDemo,
  spinner: SpinnerDemo,
  empty: EmptyDemo,
  item: ItemDemo,
  avatar: AvatarDemo,
  'aspect-ratio': AspectRatioDemo,
};
