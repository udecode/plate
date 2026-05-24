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
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;
const WHITESPACE_REGEX = /\s+/;

type Query = Awaited<ReturnType<typeof useFumadocsSearch>>['query'];
type Router = ReturnType<typeof useRouter>;

const i18n = {
  cn: {
    dark: '深色',
    light: '浅色',
    links: '链接',
    noResults: '没有结果。',
    placeholder: '输入命令或搜索...',
    search: '搜索',
    searchDescription: '搜索文档。',
    searchDocumentation: '搜索文档...',
    searchResults: '搜索结果',
    searchShort: '搜索...',
    searching: '搜索中...',
    system: '系统',
    theme: '主题',
  },
  en: {
    dark: 'Dark',
    light: 'Light',
    links: 'Links',
    noResults: 'No results found.',
    placeholder: 'Type a command or search...',
    search: 'Search',
    searchDescription: 'Search documentation.',
    searchDocumentation: 'Search documentation...',
    searchResults: 'Search Results',
    searchShort: 'Search...',
    searching: 'Searching...',
    system: 'System',
    theme: 'Theme',
  },
};

function getNavTitle(item: NavItemWithChildren, locale: string) {
  return locale === 'cn' ? item.titleCn || item.title : item.title;
}

function isString(value: string | undefined): value is string {
  return Boolean(value);
}

function getItemKeywords(item: NavItemWithChildren, parentTitle = '') {
  return [
    ...(item.keywords ?? []),
    ...(Array.isArray(item.label)
      ? item.label
      : item.label
        ? [item.label]
        : []),
    parentTitle,
    item.titleCn,
  ].filter(isString);
}

function navigateToHref(router: Router, href: string) {
  if (ABSOLUTE_HREF_REGEX.test(href)) {
    window.open(href, '_blank', 'noopener,noreferrer');
    return;
  }

  router.push(href);
}

function CommandItems({
  item,
  locale,
  parentTitle = '',
  runCommand,
}: {
  item: NavItemWithChildren;
  locale: string;
  runCommand: (command: () => unknown) => void;
  parentTitle?: string;
}) {
  const router = useRouter();
  const title = getNavTitle(item, locale);
  const keywords = getItemKeywords(item, parentTitle);

  return (
    <>
      {item.href && (
        <CommandItem
          key={item.href}
          onSelect={() => {
            runCommand(() =>
              navigateToHref(router, hrefWithLocale(item.href!, locale))
            );
          }}
          keywords={keywords}
          value={`${parentTitle} ${title ?? ''} ${item.titleCn ?? ''} ${
            item.href
          }`}
        >
          <div className="flex items-center justify-center">
            <Circle />
          </div>
          {title}
        </CommandItem>
      )}
      {item.items?.map((child) => (
        <CommandItems
          key={child.href ?? `${item.title}:${child.title}`}
          item={child}
          locale={locale}
          parentTitle={title ?? parentTitle}
          runCommand={runCommand}
        />
      ))}
    </>
  );
}

function CommandMenuGroup({
  locale,
  runCommand,
  ...group
}: {
  locale: string;
  runCommand: (command: () => unknown) => void;
} & SidebarNavItem) {
  if (!group.items?.length) return null;

  const title = getNavTitle(group, locale);

  return (
    <CommandGroup heading={title}>
      {group.items.map((navItem) => (
        <CommandItems
          key={navItem.href ?? `${group.title}:${navItem.title}`}
          item={navItem}
          locale={locale}
          parentTitle={title}
          runCommand={runCommand}
        />
      ))}
    </CommandGroup>
  );
}

function SearchResults({
  content,
  locale,
  query,
  search,
  setOpen,
}: {
  content: (typeof i18n)['en'];
  locale: string;
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
    <CommandGroup heading={content.searchResults}>
      {uniqueResults.map((item) => (
        <CommandItem
          key={item.id}
          data-type={item.type}
          onSelect={() => {
            router.push(hrefWithLocale(item.url, locale));
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
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
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
        <span className="hidden lg:inline-flex">
          {content.searchDocumentation}
        </span>
        <span className="inline-flex lg:hidden">{content.searchShort}</span>
        <kbd className="pointer-events-none absolute top-[0.3rem] right-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>{content.search}</DialogTitle>
            <DialogDescription>{content.searchDescription}</DialogDescription>
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
                placeholder={content.placeholder}
              />
              {query.isLoading && (
                <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
            </div>
            <CommandEmpty>
              {query.isLoading ? content.searching : content.noResults}
            </CommandEmpty>
            <CommandList>
              <CommandGroup heading={content.links}>
                {navItems
                  .filter((navItem) => !navItem.external)
                  .map((navItem) => {
                    const title = getNavTitle(navItem, locale);

                    return (
                      <CommandItem
                        key={navItem.href}
                        onSelect={() => {
                          runCommand(() =>
                            navigateToHref(
                              router,
                              hrefWithLocale(navItem.href!, locale)
                            )
                          );
                        }}
                        value={`Link ${title ?? ''} ${
                          navItem.titleCn ?? ''
                        } ${navItem.href ?? ''}`}
                      >
                        <File />
                        {title}
                      </CommandItem>
                    );
                  })}
              </CommandGroup>

              {sidebarNav.map((group) =>
                group.title === 'API' ? null : (
                  <CommandMenuGroup
                    key={`${group.title}:sidebar`}
                    locale={locale}
                    runCommand={runCommand}
                    {...group}
                  />
                )
              )}

              <SearchResults
                content={content}
                locale={locale}
                query={query}
                search={search}
                setOpen={setOpen}
              />

              <CommandGroup heading={content.theme}>
                <CommandItem
                  onSelect={() => runCommand(() => setTheme('light'))}
                >
                  <SunMedium />
                  {content.light}
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => setTheme('dark'))}
                >
                  <Moon />
                  {content.dark}
                </CommandItem>
                <CommandItem
                  onSelect={() => runCommand(() => setTheme('system'))}
                >
                  <Laptop />
                  {content.system}
                </CommandItem>
              </CommandGroup>

              {sidebarNav.map((group) =>
                group.title !== 'API' ? null : (
                  <CommandMenuGroup
                    key={group.title}
                    locale={locale}
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
