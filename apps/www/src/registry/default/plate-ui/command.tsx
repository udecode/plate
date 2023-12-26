'use client';

import * as React from 'react';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';

import { cn, createElementWithRef, withCn, withRef } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { Dialog, DialogContent } from './dialog';

export const Command = withCn(
  CommandPrimitive,
  'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground'
);

export function CommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = withRef(
  CommandPrimitive.Input,
  ({ className, ...props }) => (
    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
      <Icons.search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          'flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);

export const CommandList = withCn(
  CommandPrimitive.List,
  'max-h-[500px] overflow-y-auto overflow-x-hidden'
);

export const CommandEmpty = withCn(
  CommandPrimitive.Empty,
  'py-6 text-center text-sm'
);

export const CommandGroup = withCn(
  CommandPrimitive.Group,
  'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'
);

export const CommandSeparator = withCn(
  CommandPrimitive.Separator,
  '-mx-1 h-px bg-border'
);

export const CommandItem = withCn(
  CommandPrimitive.Item,
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
);

export const CommandShortcut = withCn(
  createElementWithRef('span'),
  'ml-auto text-xs tracking-widest text-muted-foreground'
);
