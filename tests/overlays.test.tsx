import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@/components/ui/combobox';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// jsdom lacks a few things Base UI and cmdk reach for
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView ??= function () {};
globalThis.matchMedia ??= ((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener() {},
  removeListener() {},
  addEventListener() {},
  removeEventListener() {},
  dispatchEvent: () => false,
})) as typeof globalThis.matchMedia;

describe('Tooltip', () => {
  it('shows its label on focus and hides it on Escape', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button aria-label="Save this station" />}>★</TooltipTrigger>
          <TooltipContent>Save this station</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );
    await userEvent.tab();
    const tip = await screen.findByText('Save this station', { selector: '[data-slot=tooltip-content]' });
    expect(tip).toHaveClass('on-sign', 'bg-popover');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByText('Save this station', { selector: '[data-slot=tooltip-content]' })).not.toBeInTheDocument(),
    );
  });
});

describe('HoverCard', () => {
  it('opens on hover', async () => {
    render(
      <HoverCard>
        <HoverCardTrigger href="#fulton" delay={0}>
          Fulton St
        </HoverCardTrigger>
        <HoverCardContent>A C J Z 2 3 4 5</HoverCardContent>
      </HoverCard>,
    );
    await userEvent.hover(screen.getByRole('link', { name: 'Fulton St' }));
    expect(await screen.findByText('A C J Z 2 3 4 5')).toHaveAttribute('data-slot', 'hover-card-content');
  });
});

function Autofill({ onCancel }: { onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button />}>Cancel autofill</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Cancel autofill?</AlertDialogTitle>
        <AlertDialogDescription>Your card won’t be topped up.</AlertDialogDescription>
        <AlertDialogCancel>Keep autofill</AlertDialogCancel>
        <AlertDialogAction
          onClick={() => {
            onCancel();
            setOpen(false);
          }}
        >
          Yes, cancel
        </AlertDialogAction>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe('AlertDialog', () => {
  it('asks, and the cancel button backs out without acting', async () => {
    const onCancel = vi.fn();
    render(<Autofill onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel autofill' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Cancel autofill?' });
    expect(dialog).toHaveAccessibleDescription('Your card won’t be topped up.');
    expect(dialog).toHaveClass('before:bg-sign-rule');
    await userEvent.click(screen.getByRole('button', { name: 'Keep autofill' }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('runs the action', async () => {
    const onCancel = vi.fn();
    render(<Autofill onCancel={onCancel} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel autofill' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Yes, cancel' }));
    expect(onCancel).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });

  it('closes on Escape', async () => {
    render(<Autofill onCancel={() => {}} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cancel autofill' }));
    await screen.findByRole('alertdialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
  });
});

describe('Sheet', () => {
  it('opens from its edge, and closes on Escape or the close button', async () => {
    render(
      <Sheet>
        <SheetTrigger render={<Button />}>Trip options</SheetTrigger>
        <SheetContent side="left">
          <SheetTitle>Trip options</SheetTitle>
          <SheetDescription>Fewest transfers</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Trip options' }));
    const sheet = await screen.findByRole('dialog', { name: 'Trip options' });
    expect(sheet).toHaveAttribute('data-side', 'left');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: 'Trip options' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('Drawer', () => {
  it('opens on its trigger and closes on Escape', async () => {
    render(
      <Drawer>
        <DrawerTrigger render={<Button />}>Next trains</DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>Times Sq–42 St</DrawerTitle>
          <DrawerDescription>Uptown trains</DrawerDescription>
        </DrawerContent>
      </Drawer>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next trains' }));
    const drawer = await screen.findByRole('dialog', { name: 'Times Sq–42 St' });
    expect(drawer).toHaveAttribute('data-slot', 'drawer-popup');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

describe('DropdownMenu', () => {
  it('opens on its trigger, runs an item and closes', async () => {
    const onSignOut = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button />}>Account</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onSignOut}>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Account' }));
    const signOut = await screen.findByRole('menuitem', { name: 'Sign out' });
    expect(signOut).toHaveClass('data-[variant=destructive]:text-error');
    await userEvent.click(signOut);
    expect(onSignOut).toHaveBeenCalledOnce();
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('toggles a checkbox item and closes on Escape', async () => {
    function Alerts() {
      const [on, setOn] = useState(false);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button />}>Account</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={on} onCheckedChange={setOn} closeOnClick={false}>
              Service alerts
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    render(<Alerts />);
    await userEvent.click(screen.getByRole('button', { name: 'Account' }));
    const item = await screen.findByRole('menuitemcheckbox', { name: 'Service alerts' });
    expect(item).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(item);
    expect(item).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });
});

describe('ContextMenu', () => {
  it('opens on right-click and runs an item', async () => {
    const onSave = vi.fn();
    render(
      <ContextMenu>
        <ContextMenuTrigger>Grand Central–42 St</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onSave}>Save station</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.contextMenu(screen.getByText('Grand Central–42 St'));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Save station' }));
    expect(onSave).toHaveBeenCalledOnce();
  });
});

describe('Menubar', () => {
  it('is a menubar whose triggers open their menus', async () => {
    const onPlan = vi.fn();
    render(
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>Trip</MenubarTrigger>
          <MenubarContent>
            <MenubarItem onClick={onPlan}>Plan a trip</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Service</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>Planned work</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>,
    );
    const bar = screen.getByRole('menubar');
    await userEvent.click(within(bar).getByRole('menuitem', { name: 'Trip' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Plan a trip' }));
    expect(onPlan).toHaveBeenCalledOnce();
  });
});

describe('Command', () => {
  it('keeps the selected item in view by scrolling its list, never the page', async () => {
    const pageScroll = vi.spyOn(Element.prototype, 'scrollIntoView');
    const ref = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Station" />
        <CommandList>
          <CommandGroup heading="Stations">
            <CommandItem ref={ref}>Fulton St</CommandItem>
            <CommandItem>Union Sq–14 St</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    await screen.findByRole('option', { name: 'Fulton St', selected: true });
    await userEvent.keyboard('{ArrowDown}');
    expect(pageScroll).not.toHaveBeenCalled();
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
    pageScroll.mockRestore();
  });

  it('filters as you type and runs the chosen item', async () => {
    const onAlerts = vi.fn();
    render(
      <Command>
        <CommandInput placeholder="Search" />
        <CommandList>
          <CommandEmpty>No station or route by that name.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={onAlerts}>Service alerts</CommandItem>
            <CommandItem>Add fare</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    await userEvent.type(screen.getByPlaceholderText('Search'), 'alert');
    expect(screen.getByRole('option', { name: 'Service alerts' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Add fare' })).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    expect(onAlerts).toHaveBeenCalledOnce();

    await userEvent.clear(screen.getByPlaceholderText('Search'));
    await userEvent.type(screen.getByPlaceholderText('Search'), 'zzz');
    expect(screen.getByText('No station or route by that name.')).toBeInTheDocument();
  });

  it('opens as a named dialog and closes on Escape', async () => {
    function Palette() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button onClick={() => setOpen(true)}>Search</Button>
          <CommandDialog open={open} onOpenChange={setOpen} title="Find a station">
            <Command>
              <CommandInput placeholder="Station" />
              <CommandList>
                <CommandItem>Fulton St</CommandItem>
              </CommandList>
            </Command>
          </CommandDialog>
        </>
      );
    }
    render(<Palette />);
    await userEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('dialog', { name: 'Find a station' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

const STATIONS = ['Fulton St', 'Times Sq–42 St', 'Union Sq–14 St'];

function StationPicker({ onValueChange }: { onValueChange?: (v: string | null) => void }) {
  return (
    <Combobox items={STATIONS} onValueChange={onValueChange}>
      <ComboboxInput placeholder="From station" />
      <ComboboxContent>
        <ComboboxEmpty>No station by that name.</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {item}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

describe('Combobox', () => {
  it('filters as you type and picks a station', async () => {
    const onValueChange = vi.fn();
    render(<StationPicker onValueChange={onValueChange} />);
    const input = screen.getByPlaceholderText('From station');
    await userEvent.type(input, 'sq');
    expect(await screen.findByRole('option', { name: 'Times Sq–42 St' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Union Sq–14 St' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Fulton St' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('option', { name: 'Union Sq–14 St' }));
    expect(onValueChange).toHaveBeenCalledWith('Union Sq–14 St', expect.anything());
    expect(input).toHaveValue('Union Sq–14 St');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('says when nothing matches, and closes on Escape', async () => {
    render(<StationPicker />);
    await userEvent.type(screen.getByPlaceholderText('From station'), 'zzz');
    expect(await screen.findByText('No station by that name.')).toBeVisible();
    await act(async () => {
      await userEvent.keyboard('{Escape}');
    });
    await waitFor(() => expect(screen.queryByText('No station by that name.')).not.toBeInTheDocument());
  });
});
