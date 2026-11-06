import { useState, type ReactNode } from 'react';
import { Accessibility, Bell, CreditCard, Info, LogOut, MapPin, Share2, Star, TrainFront, TriangleAlert, User } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { RouteBullet } from '@/components/ui/route-bullet';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Demos for the overlays group: tooltip, hover-card, alert-dialog, sheet,
// drawer, dropdown-menu, context-menu, menubar, command and combobox.

const STATIONS = [
  'Times Sq–42 St',
  'Grand Central–42 St',
  'Union Sq–14 St',
  'Fulton St',
  'Atlantic Av–Barclays Ctr',
  'Jackson Hts–Roosevelt Av',
  '161 St–Yankee Stadium',
  'Coney Island–Stillwell Av',
];

const LINES = ['A', 'C', 'E', 'B', 'D', 'F', 'M', 'G', 'J', 'Z', 'L', 'N', 'Q', 'R', 'W', '1', '2', '3', '4', '5', '6', '7'];

function TooltipDemo() {
  return (
    <TooltipProvider>
      <div className="flex gap-2">
        {[
          { icon: <Star />, label: 'Save this station' },
          { icon: <Bell />, label: 'Service alerts' },
          { icon: <Share2 />, label: 'Share trip' },
        ].map(({ icon, label }) => (
          <Tooltip key={label}>
            <TooltipTrigger render={<Button variant="outline" size="icon" aria-label={label} />}>{icon}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

function HoverCardDemo() {
  return (
    <p className="text-sm">
      Change at{' '}
      <HoverCard>
        <HoverCardTrigger href="#station" className="font-bold underline decoration-2 underline-offset-4">
          Fulton St
        </HoverCardTrigger>
        <HoverCardContent className="flex flex-col gap-3">
          <p className="text-base font-bold tracking-tight">Fulton St</p>
          <div className="flex gap-1">
            {['A', 'C', 'J', 'Z', '2', '3', '4', '5'].map((r) => (
              <RouteBullet key={r} route={r} size="sm" />
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Accessibility className="size-4" /> Elevators to all platforms
          </p>
        </HoverCardContent>
      </HoverCard>{' '}
      for the 4 and 5 express.
    </p>
  );
}

function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>Cancel MetroCard autofill</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <TriangleAlert />
          </AlertDialogMedia>
          <AlertDialogTitle>Cancel autofill?</AlertDialogTitle>
          <AlertDialogDescription>Your card won’t be topped up when it runs low. You can turn it back on any time.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep autofill</AlertDialogCancel>
          <AlertDialogCancel variant="destructive">Cancel autofill</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" />}>Trip options</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Trip options</SheetTitle>
          <SheetDescription>How you’d like to get from Union Sq to Coney Island.</SheetDescription>
        </SheetHeader>
        <ul className="flex flex-col gap-3 px-4">
          {[
            ['Fewest transfers', 'Q direct · 52 min'],
            ['Fastest', 'N to Atlantic Av, Q · 47 min'],
            ['Accessible stations only', 'Q direct · 52 min'],
          ].map(([name, route]) => (
            <li key={name} className="flex flex-col border-b border-border pb-3">
              <span className="font-bold">{name}</span>
              <span className="text-muted-foreground">{route}</span>
            </li>
          ))}
        </ul>
        <SheetFooter>
          <SheetClose render={<Button />}>Done</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DrawerDemo() {
  return (
    <Drawer showSwipeHandle>
      <DrawerTrigger render={<Button variant="outline" />}>Next trains</DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Times Sq–42 St</DrawerTitle>
            <DrawerDescription>Uptown trains in the next 15 minutes.</DrawerDescription>
          </DrawerHeader>
          <ul className="flex flex-col gap-2 p-4 text-sm">
            {[
              ['1', 'Van Cortlandt Park–242 St', '2 min'],
              ['2', 'Wakefield–241 St', '5 min'],
              ['3', 'Harlem–148 St', '9 min'],
            ].map(([route, to, when]) => (
              <li key={route} className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <span className="flex items-center gap-2 font-bold">
                  <RouteBullet route={route} size="sm" /> {to}
                </span>
                <span className="text-muted-foreground">{when}</span>
              </li>
            ))}
          </ul>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>Close</DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function DropdownMenuDemo() {
  const [alerts, setAlerts] = useState(true);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" />}>
        <User /> Account
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuItem>
            <User /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard /> OMNY cards
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Star /> Saved stations
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked={alerts} onCheckedChange={setAlerts}>
          Service alerts
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-28 w-full max-w-sm items-center justify-center border-2 border-dashed border-border text-sm text-muted-foreground">
        Right-click Grand Central–42 St
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuLabel>Grand Central–42 St</ContextMenuLabel>
          <ContextMenuItem>
            <MapPin /> Directions from here
          </ContextMenuItem>
          <ContextMenuItem>
            <Star /> Save station
            <ContextMenuShortcut>⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            <Info /> Station info
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <ContextMenuItem disabled>
          <Accessibility /> Elevator status
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MenubarDemo() {
  const [map, setMap] = useState('subway');
  const [accessible, setAccessible] = useState(false);
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>Trip</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            Plan a trip <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>Recent trips</MenubarItem>
          <MenubarSeparator />
          <MenubarCheckboxItem checked={accessible} onCheckedChange={setAccessible}>
            Accessible stations only
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Map</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarLabel>Show</MenubarLabel>
            <MenubarRadioGroup value={map} onValueChange={setMap}>
              <MenubarRadioItem value="subway">Subway</MenubarRadioItem>
              <MenubarRadioItem value="bus">Bus</MenubarRadioItem>
              <MenubarRadioItem value="night">Late night</MenubarRadioItem>
            </MenubarRadioGroup>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Service</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Planned work</MenubarItem>
          <MenubarItem>Elevator outages</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

function CommandItems() {
  return (
    <>
      <CommandEmpty>No station or route by that name.</CommandEmpty>
      <CommandGroup heading="Stations">
        {STATIONS.slice(0, 4).map((s) => (
          <CommandItem key={s}>
            <TrainFront /> {s}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Actions">
        <CommandItem>
          <Bell /> Service alerts <CommandShortcut>⌘A</CommandShortcut>
        </CommandItem>
        <CommandItem>
          <CreditCard /> Add fare <CommandShortcut>⌘F</CommandShortcut>
        </CommandItem>
      </CommandGroup>
    </>
  );
}

function CommandDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex max-w-sm flex-col items-start gap-4">
      <Command className="border border-border">
        <CommandInput placeholder="Station, route or action…" />
        <CommandList>
          <CommandItems />
        </CommandList>
      </Command>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open the palette
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Station, route or action…" />
          <CommandList>
            <CommandItems />
          </CommandList>
        </Command>
      </CommandDialog>
    </div>
  );
}

function ComboboxDemo() {
  const anchor = useComboboxAnchor();
  return (
    <div className="grid max-w-sm gap-4">
      <Combobox items={STATIONS}>
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
      <Combobox multiple autoHighlight items={LINES} defaultValue={['A', 'C']}>
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: string[]) => (
              <>
                {values.map((v) => (
                  <ComboboxChip key={v}>{v} train</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder="Follow a line" />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No line by that name.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                <RouteBullet route={item} size="sm" aria-hidden /> {item} train
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export const OVERLAYS_DEMOS: Record<string, () => ReactNode> = {
  tooltip: () => <TooltipDemo />,
  'hover-card': () => <HoverCardDemo />,
  'alert-dialog': () => <AlertDialogDemo />,
  sheet: () => <SheetDemo />,
  drawer: () => <DrawerDemo />,
  'dropdown-menu': () => <DropdownMenuDemo />,
  'context-menu': () => <ContextMenuDemo />,
  menubar: () => <MenubarDemo />,
  command: () => <CommandDemo />,
  combobox: () => <ComboboxDemo />,
};
