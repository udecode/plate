'use client';

import * as React from 'react';

import type {
  MainNavItem,
  NavItemWithChildren,
  SidebarNavItem,
} from '@/types/nav';
import type { DialogProps } from '@radix-ui/react-dialog';

import { useDocsSearch as useFumadocsSearch } from 'fumadocs-core/search/client';
import { Circle, File, Laptop, Moon, SunMedium } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const WHITESPACE_REGEX = /\s+/;

type Query = Awaited<ReturnType<typeof useFumadocsSearch>>['query'];

function getItemKeywords(item: NavItemWithChildren, parentTitle = '') {
  return [
    ...(item.keywords ?? []),
    ...(Array.isArray(item.label)
      ? item.label
      : item.label
        ? [item.label]
        : []),
    parentTitle,
  ].filter(Boolean);
}

function CommandItems({
  item,
  parentTitle = '',
  runCommand,
}: {
  item: NavItemWithChildren;
  runCommand: (command: () => unknown) => void;
  parentTitle?: string;
}) {
  const router = useRouter();
  const keywords = getItemKeywords(item, parentTitle);

  return (
    <>
      {item.href && (
        <CommandItem
          key={item.href}
          onSelect={() => {
            runCommand(() => router.push(item.href as string));
          }}
          keywords={keywords}
          value={`${parentTitle} ${item.title ?? ''} ${item.href}`}
        >
          <div className="flex items-center justify-center">
            <Circle />
          </div>
          {item.title}
        </CommandItem>
      )}
      {item.items?.map((child) => (
        <CommandItems
          key={child.href ?? `${item.title}:${child.title}`}
          item={child}
          parentTitle={item.title ?? parentTitle}
          runCommand={runCommand}
        />
      ))}
    </>
  );
}

function CommandMenuGroup({
  runCommand,
  ...group
}: {
  runCommand: (command: () => unknown) => void;
} & SidebarNavItem) {
  if (!group.items?.length) return null;

  return (
    <CommandGroup heading={group.title}>
      {group.items.map((navItem) => (
        <CommandItems
          key={navItem.href ?? `${group.title}:${navItem.title}`}
          item={navItem}
          parentTitle={group.title}
          runCommand={runCommand}
        />
      ))}
    </CommandGroup>
  );
}

function SearchResults({
  query,
  search,
  setOpen,
}: {
  query: Query;
  search: string;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();

  const uniqueResults = React.useMemo(() => {
    if (!query.data || !Array.isArray(query.data)) {
      return [];
    }

    return query.data.filter(
      (item, index, self) =>
        !(
          item.type === 'text' &&
          item.content.trim().split(WHITESPACE_REGEX).length <= 1
        ) &&
        index === self.findIndex((result) => result.content === item.content)
    );
  }, [query.data]);

  if (!search.trim() || !query.data || query.data === 'empty') {
    return null;
  }

  if (uniqueResults.length === 0) {
    return null;
  }

  return (
    <CommandGroup heading="Search Results">
      {uniqueResults.map((item) => (
        <CommandItem
          key={item.id}
          data-type={item.type}
          onSelect={() => {
            router.push(item.url);
            setOpen(false);
          }}
          keywords={[item.content]}
          value={`${item.content} ${item.type}`}
        >
          <div className="line-clamp-1 text-sm">{item.content}</div>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export function CommandMenu({
  navItems,
  sidebarNav,
  ...props
}: DialogProps & {
  navItems: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const { setTheme } = useTheme();
  const { search, setSearch, query } = useFumadocsSearch({ type: 'fetch' });

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

  const commandFilter = React.useCallback(
    (value: string, searchValue: string, keywords?: string[]) => {
      const searchableValue = `${value} ${keywords?.join(' ') ?? ''}`;

      return searchableValue.toLowerCase().includes(searchValue.toLowerCase())
        ? 1
        : 0;
    },
    []
  );

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
        <DialogContent className="overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
            <DialogDescription>Search documentation.</DialogDescription>
          </DialogHeader>
          <Command
            className="**:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
            filter={commandFilter}
          >
            <div className="relative">
              <CommandInput
                onValueChange={(value) => {
                  React.startTransition(() => setSearch(value));
                }}
                placeholder="Type a command or search..."
              />
              {query.isLoading && (
                <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
            </div>
            <CommandEmpty>
              {query.isLoading ? 'Searching...' : 'No results found.'}
            </CommandEmpty>
            <CommandList>
              <CommandGroup heading="Links">
                {navItems
                  .filter((navItem) => !navItem.external)
                  .map((navItem) => (
                    <CommandItem
                      key={navItem.href}
                      onSelect={() => {
                        runCommand(() => router.push(navItem.href as string));
                      }}
                      value={`Link ${navItem.title ?? ''} ${navItem.href ?? ''}`}
                    >
                      <File />
                      {navItem.title}
                    </CommandItem>
                  ))}
              </CommandGroup>

              {sidebarNav.map((group) =>
                group.title === 'API' ? null : (
                  <CommandMenuGroup
                    key={`${group.title}:sidebar`}
                    runCommand={runCommand}
                    {...group}
                  />
                )
              )}

              <SearchResults query={query} search={search} setOpen={setOpen} />

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

              {sidebarNav.map((group) =>
                group.title !== 'API' ? null : (
                  <CommandMenuGroup
                    key={group.title}
                    runCommand={runCommand}
                    {...group}
                  />
                )
              )}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
