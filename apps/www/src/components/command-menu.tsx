'use client';

import * as React from 'react';

import type { NavItemWithChildren, SidebarNavItem } from '@/types/nav';
import type { DialogProps } from '@radix-ui/react-dialog';

import { Command } from 'cmdk';
import { castArray } from 'lodash';
import { Circle, File, Laptop, Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { docsConfig } from '@/config/docs';
import { cn } from '@/lib/utils';

export function CommandItems({
  idx = 0,
  item,
  parentKey = '',
  parentTitle = '',
  runCommand,
}: {
  item: NavItemWithChildren;
  runCommand: any;
  idx?: number;
  parentKey?: string;
  parentTitle?: string;
}) {
  const router = useRouter();
  const itemKey = `${parentKey}-${item.href ?? item.title}-${idx}`;

  // Invisible characters to make items unique across groups
  const invisibleSuffixes: Record<string, string> = {
    'group-API': '\uFEFF', // Zero Width No-Break Space
    'group-Examples': '\u2060', // Word Joiner
    'group-Getting Started': '\u200B', // Zero Width Space
    'group-Guides': '\u061C', // Arabic Letter Mark
    'group-Installation': '\u200C', // Zero Width Non-Joiner
    'group-Migration': '\u180E', // Mongolian Vowel Separator
    'group-Plugins': '\u200D', // Zero Width Joiner
  };

  // Dirty hack to make items unique across groups, fallback to combining different characters
  const getInvisibleSuffix = (key: string) => {
    if (invisibleSuffixes[key]) return invisibleSuffixes[key];
    // Generate a unique invisible character combination for unknown groups
    const hash = key
      .split('')
      .reduce((a, b) => Math.trunc((a << 5) - a + (b.codePointAt(0) ?? 0)), 0);
    const suffixIndex = Math.abs(hash) % 7;
    const fallbackSuffixes = [
      '\u200B',
      '\u200C',
      '\u200D',
      '\u2060',
      '\uFEFF',
      '\u061C',
      '\u180E',
    ];
    return fallbackSuffixes[suffixIndex];
  };

  const invisibleSuffix = getInvisibleSuffix(parentKey);

  // Extract keywords from the item, including labels and parent title
  const { keywords = [] } = item;
  const allKeywords = [
    ...keywords,
    ...castArray(item.label),
    ...(parentTitle ? [parentTitle] : []),
  ].filter(Boolean);

  return (
    <React.Fragment key={itemKey}>
      {item.href && (
        <CommandItem
          onSelect={() => {
            runCommand(() => router.push(item.href as string));
          }}
          keywords={allKeywords}
        >
          <div className="flex items-center justify-center">
            <Circle className="size-3" />
          </div>
          {item.title}
          {invisibleSuffix}
        </CommandItem>
      )}
      {item.headings?.map((heading, headingIdx) => (
        <CommandItem
          key={`${itemKey}-heading-${headingIdx}`}
          onSelect={() => {
            runCommand(() =>
              router.push(
                (item.href +
                  '#' +
                  heading.replaceAll(' ', '').toLowerCase()) as string
              )
            );
          }}
          keywords={allKeywords}
        >
          <div className="flex items-center justify-center">
            <Circle className="size-3" />
          </div>
          {item.title} – {heading}
          {invisibleSuffix}
        </CommandItem>
      ))}
      {item.items?.map((child, childIdx) => (
        <CommandItems
          key={`${itemKey}-child-${childIdx}`}
          idx={childIdx}
          item={child}
          parentKey={itemKey}
          parentTitle={item.title}
          runCommand={runCommand}
        />
      ))}
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
      {group.items?.map((navItem, navIdx) => (
        <CommandItems
          key={`group-${group.title}-${navIdx}`}
          idx={navIdx}
          item={navItem}
          parentKey={`group-${group.title}`}
          parentTitle={group.title}
          runCommand={runCommand}
        />
      ))}
    </CommandGroup>
  );
}

export function CommandMenu({ ...props }: DialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === '/') {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

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
          'relative flex h-8 w-full items-center justify-start rounded-[0.5rem] bg-muted/50 font-normal text-muted-foreground text-sm shadow-none sm:pr-12 md:w-40 lg:w-56 xl:w-64'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        <DialogContent className="overflow-hidden p-0">
          <Command
            className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
            filter={(value, search, keywords) => {
              const searchValue = search.toLowerCase();
              if (
                value.toLowerCase().includes(searchValue) ||
                keywords?.some((keyword) =>
                  keyword.toLowerCase().includes(searchValue)
                )
              ) {
                return 1;
              }
              return 0;
            }}
          >
            <CommandInput placeholder="Type a command or search..." />
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandList>
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
                      <File />
                      {navItem.title}
                    </CommandItem>
                  ))}
              </CommandGroup>
              {docsConfig.sidebarNav.map((group) => {
                if (group.title === 'API') return null;

                return (
                  <CommandMenuGroup
                    key={`${group.title}:sidebar`}
                    runCommand={runCommand}
                    {...group}
                  />
                );
              })}

              <CommandGroup heading="Theme">
                <CommandItem
                  onSelect={() => runCommand(() => setTheme('light'))}
                >
                  <SunMedium />
                  Light
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => setTheme('dark'))}
                >
                  <Moon />
                  Dark
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => setTheme('system'))}
                >
                  <Laptop />
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
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
