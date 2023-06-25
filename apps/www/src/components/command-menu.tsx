'use client';

import { ReactNode } from 'react';
import * as React from 'react';
import { DialogProps } from '@radix-ui/react-alert-dialog';
import { Circle, File, Laptop, Moon, SunMedium } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';

import { docsConfig } from '@/config/docs';
import { cn } from '@/lib/utils';
import { Button } from '@/registry/default/ui/button';
import { NavItemWithChildren, SidebarNavItem } from '@/types/nav';

export function CommandItems({
  item,
  runCommand,
  children,
}: {
  children?: ReactNode;
  item: NavItemWithChildren;
  runCommand: any;
}) {
  const router = useRouter();

  return (
    <React.Fragment key={item.href}>
      <CommandItem
        onSelect={() => {
          runCommand(() => router.push(item.href as string));
        }}
      >
        <div className="mr-2 flex h-4 w-4 items-center justify-center">
          <Circle className="h-3 w-3" />
        </div>
        {item.title}
      </CommandItem>
      {item.headings?.map((heading) => {
        return (
          <CommandItem
            key={heading}
            onSelect={() => {
              runCommand(() =>
                router.push(
                  (item.href +
                    '#' +
                    heading.replaceAll(' ', '').toLowerCase()) as string
                )
              );
            }}
          >
            <div className="mr-2 flex h-4 w-4 items-center justify-center">
              <Circle className="h-3 w-3" />
            </div>
            {item.title} – {heading}
          </CommandItem>
        );
      })}

      {children}
    </React.Fragment>
  );
}

export function CommandMenuGroup({
  runCommand,
  ...group
}: {
  runCommand: any;
} & SidebarNavItem) {
  return (
    <CommandGroup heading={group.title}>
      {group.items?.map((navItem) => {
        return (
          <CommandItems
            key={navItem.title}
            item={navItem}
            runCommand={runCommand}
          >
            {navItem.items?.map((item) => {
              return (
                <CommandItems
                  key={item.title}
                  item={item}
                  runCommand={runCommand}
                />
              );
            })}
          </CommandItems>
        );
      })}
    </CommandGroup>
  );
}

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((_open) => !_open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Links">
            {docsConfig.mainNav
              .filter((navitem) => !navitem.external)
              .map((navItem) => (
                <CommandItem
                  key={navItem.href}
                  onSelect={() => {
                    runCommand(() => router.push(navItem.href as string));
                  }}
                >
                  <File className="mr-2 h-4 w-4" />
                  {navItem.title}
                </CommandItem>
              ))}
          </CommandGroup>
          {docsConfig.sidebarNav.map((group) => {
            if (group.title === 'API') return null;

            return (
              <CommandMenuGroup
                key={group.title}
                runCommand={runCommand}
                {...group}
              />
            );
          })}
          {docsConfig.componentsNav.map((group) => (
            <CommandMenuGroup
              key={group.title}
              runCommand={runCommand}
              {...group}
            />
          ))}

          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme('light'))}>
              <SunMedium className="mr-2 h-4 w-4" />
              Light
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('dark'))}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme('system'))}>
              <Laptop className="mr-2 h-4 w-4" />
              System
            </CommandItem>
          </CommandGroup>

          {docsConfig.sidebarNav.map((group) => {
            // API is last
            if (group.title !== 'API') return null;

            return (
              <CommandMenuGroup
                key={group.title}
                runCommand={runCommand}
                {...group}
              />
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
