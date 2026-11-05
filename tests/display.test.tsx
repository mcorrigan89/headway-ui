import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';

// jsdom has no ResizeObserver; the navigation menu measures its popup with one
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('Accordion', () => {
  it('opens a section and closes it again', async () => {
    render(
      <Accordion>
        <AccordionItem value="elevators">
          <AccordionTrigger>Are the elevators working?</AccordionTrigger>
          <AccordionContent>All elevators are in service.</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    const trigger = screen.getByRole('button', { name: 'Are the elevators working?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('All elevators are in service.')).toBeVisible();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Collapsible', () => {
  it('shows and hides its panel', async () => {
    render(
      <Collapsible>
        <CollapsibleTrigger>Skipped stops</CollapsibleTrigger>
        <CollapsibleContent>14 St, 23 St</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole('button', { name: 'Skipped stops' });
    expect(screen.queryByText('14 St, 23 St')).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('14 St, 23 St')).toBeVisible();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Breadcrumb and Pagination', () => {
  it('mark where you are', () => {
    render(
      <>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#stations">Stations</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Times Sq–42 St</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink href="#1">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#2" isActive>
                2
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </>,
    );
    const trail = screen.getByRole('navigation', { name: 'breadcrumb' });
    expect(within(trail).getByRole('link', { name: 'Stations' })).toHaveAttribute('href', '#stations');
    expect(within(trail).getByText('Times Sq–42 St')).toHaveAttribute('aria-current', 'page');
    // the separator arrow is decoration
    expect(within(trail).queryByRole('img')).not.toBeInTheDocument();
    const pages = screen.getByRole('navigation', { name: 'pagination' });
    expect(within(pages).getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page');
    expect(within(pages).getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current');
  });
});

describe('NavigationMenu', () => {
  it('opens a panel of links from its trigger', async () => {
    render(
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Fares</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="#tap">Tap to pay</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>,
    );
    const trigger = screen.getByRole('button', { name: 'Fares' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: 'Tap to pay' })).not.toBeInTheDocument();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(await screen.findByRole('link', { name: 'Tap to pay' })).toHaveAttribute('href', '#tap');
  });
});

describe('Avatar, Item, Spinner and AspectRatio', () => {
  it('Avatar shows the initials when there is no image', () => {
    render(
      <Avatar>
        <AvatarFallback>MT</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('MT')).toBeInTheDocument();
  });

  it('Item can be a real link', () => {
    render(
      // the link's text comes from the Item's children
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label
      <Item render={<a href="#accessible" />}>
        <ItemContent>
          <ItemTitle>Accessible stations</ItemTitle>
        </ItemContent>
      </Item>,
    );
    expect(screen.getByRole('link', { name: 'Accessible stations' })).toHaveAttribute('href', '#accessible');
  });

  it('Spinner announces that something is loading', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('AspectRatio holds its shape', () => {
    const { container } = render(<AspectRatio ratio={16 / 9} />);
    expect((container.firstChild as HTMLElement).style.getPropertyValue('--ratio')).toBe(String(16 / 9));
  });
});
