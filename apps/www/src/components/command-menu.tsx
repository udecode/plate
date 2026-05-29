'use client';

import * as React from 'react';

import type {
  MainNavItem,
  NavItemWithChildren,
  SidebarNavItem,
} from '@/types/nav';
import type { DialogProps } from '@radix-ui/react-dialog';

import { useDocsSearch as useFumadocsSearch } from 'fumadocs-core/search/client';
import {
  ArrowRight,
  Circle,
  CornerDownLeft,
  Laptop,
  Moon,
  SunMedium,
} from 'lucide-react';
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
import { useMutationObserver } from '@/hooks/use-mutation-observer';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

const ABSOLUTE_HREF_REGEX = /^[a-z][a-z\d+\-.]*:/i;
const WHITESPACE_REGEX = /\s+/;

type Query = Awaited<ReturnType<typeof useFumadocsSearch>>['query'];
type Push = ReturnType<typeof useRouter>['push'];

const i18n = {
  cn: {
    dark: '深色',
    light: '浅色',
    links: '链接',
    pages: '页面',
    goToPage: '打开页面',
    noResults: '没有结果。',
    runCommand: '运行命令',
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
    pages: 'Pages',
    goToPage: 'Go to Page',
    noResults: 'No results found.',
    runCommand: 'Run Command',
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

function navigateToHref(push: Push, href: string) {
  if (ABSOLUTE_HREF_REGEX.test(href)) {
    window.open(href, '_blank', 'noopener,noreferrer');
    return;
  }

  push(href);
}

function CommandItems({
  content,
  item,
  locale,
  onHighlight,
  parentTitle = '',
  runCommand,
}: {
  content: (typeof i18n)['en'];
  item: NavItemWithChildren;
  locale: string;
  onHighlight: (label: string) => void;
  runCommand: (command: () => unknown) => void;
  parentTitle?: string;
}) {
  const { push } = useRouter();
  const title = getNavTitle(item, locale);
  const keywords = getItemKeywords(item, parentTitle);

  return (
    <>
      {item.href && (
        <CommandMenuItem
          key={item.href}
          onHighlight={() => onHighlight(content.goToPage)}
          onSelect={() => {
            runCommand(() =>
              navigateToHref(push, hrefWithLocale(item.href!, locale))
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
        </CommandMenuItem>
      )}
      {item.items?.map((child) => (
        <CommandItems
          key={child.href ?? `${item.title}:${child.title}`}
          content={content}
          item={child}
          locale={locale}
          onHighlight={onHighlight}
          parentTitle={title ?? parentTitle}
          runCommand={runCommand}
        />
      ))}
    </>
  );
}

function CommandMenuGroup({
  content,
  locale,
  onHighlight,
  runCommand,
  ...group
}: {
  content: (typeof i18n)['en'];
  locale: string;
  onHighlight: (label: string) => void;
  runCommand: (command: () => unknown) => void;
} & SidebarNavItem) {
  if (!group.items?.length) return null;

  const title = getNavTitle(group, locale);

  return (
    <CommandGroup heading={title} className={commandMenuGroupClassName}>
      {group.items.map((navItem) => (
        <CommandItems
          key={navItem.href ?? `${group.title}:${navItem.title}`}
          content={content}
          item={navItem}
          locale={locale}
          onHighlight={onHighlight}
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
  onHighlight,
  setOpen,
}: {
  content: (typeof i18n)['en'];
  locale: string;
  query: Query;
  search: string;
  onHighlight: (label: string) => void;
  setOpen: (open: boolean) => void;
}) {
  const { push } = useRouter();

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
    <CommandGroup
      heading={content.searchResults}
      className={commandMenuGroupClassName}
    >
      {uniqueResults.map((item) => (
        <CommandMenuItem
          key={item.id}
          data-type={item.type}
          onHighlight={() => onHighlight(content.goToPage)}
          onSelect={() => {
            push(hrefWithLocale(item.url, locale));
            setOpen(false);
          }}
          keywords={[item.content]}
          value={`${item.content} ${item.type}`}
        >
          <div className="line-clamp-1 text-sm">{item.content}</div>
        </CommandMenuItem>
      ))}
    </CommandGroup>
  );
}

const commandMenuGroupClassName =
  'p-0! **:[[cmdk-group-heading]]:scroll-mt-16 **:[[cmdk-group-heading]]:p-3! **:[[cmdk-group-heading]]:pb-1!';

function CommandMenuItem({
  children,
  className,
  onHighlight,
  ...props
}: React.ComponentProps<typeof CommandItem> & {
  onHighlight?: () => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);

  useMutationObserver(ref, (mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'aria-selected' &&
        ref.current?.getAttribute('aria-selected') === 'true'
      ) {
        onHighlight?.();
      }
    });
  });

  return (
    <CommandItem
      ref={ref}
      className={cn(
        'h-9 rounded-md border border-transparent px-3! font-medium data-[selected=true]:border-input data-[selected=true]:bg-input/50',
        className
      )}
      {...props}
    >
      {children}
    </CommandItem>
  );
}

function CommandMenuKbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        "pointer-events-none flex h-5 select-none items-center justify-center gap-1 rounded border bg-background px-1 font-medium font-sans text-[0.7rem] text-muted-foreground [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
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
  const { push } = useRouter();
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const [open, setOpen] = React.useState(false);
  const [renderDelayedGroups, setRenderDelayedGroups] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState(content.goToPage);
  const { setTheme } = useTheme();
  const { search, setSearch, query } = useFumadocsSearch({ type: 'fetch' });

  React.useEffect(() => {
    setSelectedAction(content.goToPage);
  }, [content.goToPage, open]);

  React.useEffect(() => {
    if (!open) {
      setRenderDelayedGroups(false);
      return;
    }

    const frame = requestAnimationFrame(() => {
      setRenderDelayedGroups(true);
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

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

  const runCommand = (command: () => unknown) => {
    setOpen(false);
    command();
  };

  const commandFilter = (
    value: string,
    searchValue: string,
    keywords?: string[]
  ) => {
    const searchableValue = `${value} ${keywords?.join(' ') ?? ''}`;

    return searchableValue.toLowerCase().includes(searchValue.toLowerCase())
      ? 1
      : 0;
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          'relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 text-foreground shadow-none transition-colors hover:bg-muted/50 md:w-48 lg:w-40 xl:w-64 dark:bg-card'
        )}
        onClick={() => setOpen(true)}
        {...props}
      >
        <span className="hidden xl:inline-flex">
          {content.searchDocumentation}
        </span>
        <span className="inline-flex xl:hidden">{content.searchShort}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[15%]! max-w-[calc(100%-2rem)] translate-y-0! overflow-hidden rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 sm:max-w-lg dark:bg-neutral-900 dark:ring-neutral-800 [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>{content.search}</DialogTitle>
            <DialogDescription>{content.searchDescription}</DialogDescription>
          </DialogHeader>
          <Command
            className="rounded-none bg-transparent **:data-[slot=command-input-wrapper]:mb-0 **:data-[slot=command-input-wrapper]:h-9! **:data-[slot=command-input]:h-9! **:data-[slot=command-input-wrapper]:rounded-md **:data-[slot=command-input-wrapper]:border **:data-[slot=command-input-wrapper]:border-input **:data-[slot=command-input-wrapper]:bg-input/50 **:data-[slot=command-input]:py-0 [&_[cmdk-item]_svg]:size-5"
            filter={commandFilter}
          >
            <div className="relative">
              <CommandInput
                onValueChange={(value) => {
                  React.startTransition(() => setSearch(value));
                }}
                placeholder={content.searchDocumentation}
              />
              {query.isLoading && (
                <div className="-translate-y-1/2 pointer-events-none absolute top-1/2 right-3 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
            </div>
            <CommandEmpty className="py-12 text-center text-muted-foreground text-sm">
              {query.isLoading ? content.searching : content.noResults}
            </CommandEmpty>
            <CommandList className="no-scrollbar min-h-80 scroll-pt-2 scroll-pb-1.5">
              <CommandGroup
                heading={content.pages}
                className={commandMenuGroupClassName}
              >
                {navItems
                  .filter((navItem) => navItem.href)
                  .map((navItem) => {
                    const title = getNavTitle(navItem, locale);

                    return (
                      <CommandMenuItem
                        key={navItem.href}
                        onHighlight={() => setSelectedAction(content.goToPage)}
                        onSelect={() => {
                          runCommand(() =>
                            navigateToHref(
                              push,
                              hrefWithLocale(navItem.href!, locale)
                            )
                          );
                        }}
                        keywords={[
                          'nav',
                          'navigation',
                          title ?? '',
                          navItem.titleCn ?? '',
                        ]}
                        value={`Page ${title ?? ''} ${navItem.titleCn ?? ''} ${
                          navItem.href ?? ''
                        }`}
                      >
                        <ArrowRight />
                        {title}
                      </CommandMenuItem>
                    );
                  })}
              </CommandGroup>

              {renderDelayedGroups ? (
                <>
                  {sidebarNav.map((group) =>
                    group.title === 'API' ? null : (
                      <CommandMenuGroup
                        key={`${group.title}:sidebar`}
                        content={content}
                        locale={locale}
                        onHighlight={setSelectedAction}
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
                    onHighlight={setSelectedAction}
                    setOpen={setOpen}
                  />

                  <CommandGroup
                    heading={content.theme}
                    className={commandMenuGroupClassName}
                  >
                    <CommandMenuItem
                      onHighlight={() => setSelectedAction(content.runCommand)}
                      onSelect={() => runCommand(() => setTheme('light'))}
                    >
                      <SunMedium />
                      {content.light}
                    </CommandMenuItem>
                    <CommandMenuItem
                      onHighlight={() => setSelectedAction(content.runCommand)}
                      onSelect={() => runCommand(() => setTheme('dark'))}
                    >
                      <Moon />
                      {content.dark}
                    </CommandMenuItem>
                    <CommandMenuItem
                      onHighlight={() => setSelectedAction(content.runCommand)}
                      onSelect={() => runCommand(() => setTheme('system'))}
                    >
                      <Laptop />
                      {content.system}
                    </CommandMenuItem>
                  </CommandGroup>

                  {sidebarNav.map((group) =>
                    group.title !== 'API' ? null : (
                      <CommandMenuGroup
                        key={group.title}
                        content={content}
                        locale={locale}
                        onHighlight={setSelectedAction}
                        runCommand={runCommand}
                        {...group}
                      />
                    )
                  )}
                </>
              ) : null}
            </CommandList>
          </Command>
          <div className="absolute inset-x-0 bottom-0 z-20 flex h-10 items-center gap-2 rounded-b-xl border-t border-t-neutral-100 bg-neutral-50 px-4 font-medium text-muted-foreground text-xs dark:border-t-neutral-700 dark:bg-neutral-800">
            <CommandMenuKbd>
              <CornerDownLeft />
            </CommandMenuKbd>
            {selectedAction}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
