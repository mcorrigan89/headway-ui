'use client';

import * as React from 'react';
import { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// A strip of menus on a black sign band (Trip, Service, Account), each
// opening a dropdown menu; the open menu's name is lit white. Arrow keys move
// between menus once one is open. The menus are the dropdown menu's own
// parts, so they look and behave the same.

function Menubar({ className, ...props }: MenubarPrimitive.Props) {
  return (
    <MenubarPrimitive
      data-slot="menubar"
      className={cn('on-sign flex h-11 w-fit items-center gap-1 rounded-none bg-sign p-1 text-sign-foreground', className)}
      {...props}
    />
  );
}

function MenubarMenu({ ...props }: React.ComponentProps<typeof DropdownMenu>) {
  return <DropdownMenu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({ ...props }: React.ComponentProps<typeof DropdownMenuGroup>) {
  return <DropdownMenuGroup data-slot="menubar-group" {...props} />;
}

function MenubarPortal({ ...props }: React.ComponentProps<typeof DropdownMenuPortal>) {
  return <DropdownMenuPortal data-slot="menubar-portal" {...props} />;
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof DropdownMenuTrigger>) {
  return (
    <DropdownMenuTrigger
      data-slot="menubar-trigger"
      className={cn(
        'flex h-full items-center rounded-none px-3 text-sm font-bold text-foreground outline-none select-none hover:bg-accent hover:text-accent-foreground focus-visible:outline-3 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ring aria-expanded:bg-primary aria-expanded:text-primary-foreground',
        className,
      )}
      {...props}
    />
  );
}

function MenubarContent({ align = 'start', alignOffset = -4, sideOffset = 4, ...props }: React.ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent data-slot="menubar-content" align={align} alignOffset={alignOffset} sideOffset={sideOffset} {...props} />;
}

function MenubarItem({ ...props }: React.ComponentProps<typeof DropdownMenuItem>) {
  return <DropdownMenuItem data-slot="menubar-item" {...props} />;
}

function MenubarCheckboxItem({ ...props }: React.ComponentProps<typeof DropdownMenuCheckboxItem>) {
  return <DropdownMenuCheckboxItem data-slot="menubar-checkbox-item" {...props} />;
}

function MenubarRadioGroup({ ...props }: React.ComponentProps<typeof DropdownMenuRadioGroup>) {
  return <DropdownMenuRadioGroup data-slot="menubar-radio-group" {...props} />;
}

function MenubarRadioItem({ ...props }: React.ComponentProps<typeof DropdownMenuRadioItem>) {
  return <DropdownMenuRadioItem data-slot="menubar-radio-item" {...props} />;
}

function MenubarLabel({ ...props }: React.ComponentProps<typeof DropdownMenuLabel>) {
  return <DropdownMenuLabel data-slot="menubar-label" {...props} />;
}

function MenubarSeparator({ ...props }: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return <DropdownMenuSeparator data-slot="menubar-separator" {...props} />;
}

function MenubarShortcut({ ...props }: React.ComponentProps<typeof DropdownMenuShortcut>) {
  return <DropdownMenuShortcut data-slot="menubar-shortcut" {...props} />;
}

function MenubarSub({ ...props }: React.ComponentProps<typeof DropdownMenuSub>) {
  return <DropdownMenuSub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({ ...props }: React.ComponentProps<typeof DropdownMenuSubTrigger>) {
  return <DropdownMenuSubTrigger data-slot="menubar-sub-trigger" {...props} />;
}

function MenubarSubContent({ ...props }: React.ComponentProps<typeof DropdownMenuSubContent>) {
  return <DropdownMenuSubContent data-slot="menubar-sub-content" {...props} />;
}

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
};
