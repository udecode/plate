'use client';

import React, { Suspense, useState } from 'react';

import type { DocsConfig } from '@/config/docs';
import type { SidebarNavItem } from '@/types/nav';

import { castArray } from 'lodash';
import { ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

const CN_PREFIX_REGEX = /^\/cn/;

export function DocsNav({ config }: { config: DocsConfig }) {
  const locale = useLocale();
  const pathname = usePathname();
  const [filter, setFilter] = useState('');
  const [activeSection, setActiveSection] = useState<string | undefined>();

  // Normalize pathname by removing /cn prefix if it exists
  const normalizedPathname = React.useMemo(
    () => pathname?.replace(CN_PREFIX_REGEX, '') ?? '',
    [pathname]
  );

  const sidebarNav = config.sidebarNav;

  // Recursive function to filter items including nested ones
  const filterItems = React.useCallback(
    (items: SidebarNavItem[], filter: string): SidebarNavItem[] => {
      return items.reduce<SidebarNavItem[]>((acc, item) => {
        const { keywords = [], ...itemWithoutKeywords } = item;
        const itemMatches =
          item.title?.toLowerCase().includes(filter) ||
          [...keywords, ...castArray(item.label)].some((label) =>
            label?.toLowerCase().includes(filter)
          );

        // If the parent item matches, include ALL its children without filtering
        // Otherwise, recursively filter nested items
        const filteredNestedItems = item.items
          ? itemMatches
            ? item.items // Show all children if parent matches
            : filterItems(item.items, filter) // Filter children if parent doesn't match
          : undefined;

        // Include the item if it matches OR has matching nested items
        if (
          itemMatches ||
          (filteredNestedItems && filteredNestedItems.length > 0)
        ) {
          acc.push({
            ...itemWithoutKeywords,
            ...(filteredNestedItems && { items: filteredNestedItems }),
          });
        }

        return acc;
      }, []);
    },
    []
  );

  const filteredNav = React.useMemo(() => {
    const lowercasedFilter = filter?.toLowerCase();

    return sidebarNav
      .map((section) => {
        const sectionMatches = section.title
          ?.toLowerCase()
          .includes(lowercasedFilter);

        return {
          ...section,
          items: sectionMatches
            ? section.items
            : section.items
              ? filterItems(section.items, lowercasedFilter)
              : undefined,
        };
      })
      .filter((section) => section.items && section.items.length > 0);
  }, [sidebarNav, filter, filterItems]);

  // Helper function to recursively check if any nested item is active
  const hasActiveNestedItem = React.useCallback(
    (items: SidebarNavItem[], pathname: string): boolean =>
      items.some((item) => {
        if (item.href === pathname) return true;
        if (item.items?.length) {
          return hasActiveNestedItem(item.items, pathname);
        }
        return false;
      }),
    []
  );

  // Update active section when pathname changes
  React.useEffect(() => {
    if (!normalizedPathname) return;

    const newActiveIndex = filteredNav.findIndex((section) =>
      section.items
        ? hasActiveNestedItem(section.items, normalizedPathname)
        : false
    );

    setActiveSection(
      newActiveIndex === -1 ? undefined : `item-${newActiveIndex}`
    );
  }, [normalizedPathname, filteredNav, hasActiveNestedItem]);

  // Auto-scroll to active item only on mount. To be improved.
  React.useEffect(() => {
    if (!normalizedPathname) return;

    // Scroll to active item after a short delay to ensure accordion is open
    const scrollToActiveItem = () => {
      const activeElement = document.querySelector(
        `[data-href="${normalizedPathname}"]`
      ) as HTMLElement;

      if (activeElement) {
        // Find the accordion item with data-state="open" that contains this element
        const openAccordionItem = activeElement.closest(
          '[data-state="open"][data-slot="accordion-item"]'
        ) as HTMLElement;

        if (openAccordionItem) {
          // Find the scrollable div inside the open accordion item
          const scrollableDiv = openAccordionItem.querySelector(
            'div[class*="overflow-y-auto"]'
          ) as HTMLElement;

          if (scrollableDiv) {
            const containerRect = scrollableDiv.getBoundingClientRect();
            const elementRect = activeElement.getBoundingClientRect();
            const relativeTop = elementRect.top - containerRect.top;
            const scrollTop = scrollableDiv.scrollTop;

            // Calculate the position to scroll to (position item at top with offset)
            const targetScrollTop = scrollTop + relativeTop - 32;

            scrollableDiv.scrollTo({
              top: Math.max(0, targetScrollTop),
            });
          }
        }
      }
    };

    // Delay to ensure accordion animation completes. Not always working well.
    const timeoutId = setTimeout(scrollToActiveItem, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only runs on mount

  return sidebarNav.length > 0 ? (
    <div className="relative w-[calc(100%-1rem)] pl-4">
      <div className="sticky top-0 z-10 flex w-full items-center bg-background/95 px-2 pb-1 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="relative mt-1 flex w-full items-center">
          <Input
            className={cn(
              'h-8 w-full rounded-lg bg-muted/50 px-3 py-1 text-muted-foreground text-sm shadow-none focus-visible:ring-transparent'
            )}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
          />
          {filter && (
            <button
              className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setFilter('')}
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <Accordion
        className="flex max-h-[calc(100vh-var(--header-height)-44px)] flex-col overflow-y-hidden"
        value={activeSection}
        onValueChange={setActiveSection}
        type="single"
        collapsible
      >
        {filteredNav.map((item, index) => (
          <AccordionItem
            key={index}
            className="flex flex-col overflow-y-hidden data-[state=closed]:shrink-0 data-[state=open]:grow"
            value={`item-${index}`}
          >
            <AccordionTrigger className="h-9 shrink-0 items-center px-2 py-1 text-sm outline-none">
              <div className="flex items-center">
                {locale === 'cn' ? item.titleCn || item.title : item.title}
                {item.label && (
                  <div className="flex gap-1">
                    {castArray(item.label).map((label, labelIndex) => (
                      <span
                        key={labelIndex}
                        className={cn(
                          'ml-2 rounded-md bg-secondary px-1.5 py-0.5 font-medium text-foreground text-xs leading-none',
                          label === 'Plus' &&
                            'bg-primary text-background dark:text-background',
                          label === 'New' && 'bg-[#adfa1d] dark:text-background'
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <Suspense fallback={null}>
              <ScrollableAccordionContent>
                {item?.items?.length && (
                  <DocsNavItems
                    items={item.items}
                    pathname={normalizedPathname}
                  />
                )}
              </ScrollableAccordionContent>
            </Suspense>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  ) : null;
}

function DocsNavItems({
  className,
  depth = 0,
  items,
  pathname,
}: {
  items: SidebarNavItem[];
  pathname: string | null;
  className?: string;
  depth?: number;
}) {
  const locale = useLocale();

  // Normalize pathname by removing /cn prefix if it exists
  const normalizedPathname = pathname?.replace(CN_PREFIX_REGEX, '') ?? '';

  return items?.length ? (
    <div
      className={cn(
        'grid grid-flow-row auto-rows-max gap-0.5 text-sm',
        className
      )}
    >
      {items.map((item, index) =>
        item.disabled ? (
          <span
            key={index}
            className={cn(
              'flex w-full items-center rounded-md p-2 text-muted-foreground hover:underline',
              item.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {locale === 'cn' ? item.titleCn || item.title : item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs leading-none no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </span>
        ) : (
          <React.Fragment key={index}>
            {item.href ? (
              <Link
                className={cn(
                  'group relative flex h-8 w-full items-center truncate whitespace-nowrap rounded-lg px-2 after:absolute after:inset-x-0 after:inset-y-[-2px] after:rounded-lg hover:bg-accent hover:text-accent-foreground',
                  item.disabled && 'cursor-not-allowed opacity-60',
                  normalizedPathname === item.href
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'font-normal text-foreground'
                )}
                data-href={item.href}
                href={hrefWithLocale(item.href, locale)}
                rel={item.external ? 'noreferrer' : ''}
                target={item.external ? '_blank' : ''}
              >
                {locale === 'cn' ? item.titleCn || item.title : item.title}
                {item.label && (
                  <div className="ml-2 flex gap-1">
                    {castArray(item.label).map((label, labelIndex) => (
                      <span
                        key={labelIndex}
                        className={cn(
                          'rounded-md bg-secondary px-1.5 py-0.5 font-medium text-foreground text-xs leading-none',
                          label === 'Plus' &&
                            'bg-primary text-background dark:text-background',
                          label === 'New' && 'bg-[#adfa1d] dark:text-background'
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {/* {item.title?.toLowerCase().includes('leaf') && (
                  <Leaf className="ml-auto size-4 text-foreground/80" />
                )} */}
              </Link>
            ) : (
              <span
                className={cn(
                  'flex h-8 w-full select-none items-center truncate rounded-lg px-2 font-medium text-foreground'
                )}
              >
                {locale === 'cn' ? item.titleCn || item.title : item.title}
                {item.label && (
                  <div className="ml-2 flex gap-1">
                    {castArray(item.label).map((label, labelIndex) => (
                      <span
                        key={labelIndex}
                        className={cn(
                          'rounded-md bg-secondary px-1.5 py-0.5 font-medium text-foreground text-xs leading-none',
                          label === 'Plus' &&
                            'bg-primary text-background dark:text-background',
                          label === 'New' && 'bg-[#adfa1d] dark:text-background'
                        )}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                )}
                {/* {item.title?.toLowerCase().includes('leaf') && (
                  <Leaf className="ml-auto size-4 text-foreground/80" />
                )} */}
              </span>
            )}
            {!!item.items?.length && (
              <div
                className={cn(
                  'mb-1 ml-2 border-border/60 border-l pl-2',
                  depth > 0 && 'ml-2'
                )}
              >
                <DocsNavItems
                  depth={depth + 1}
                  items={item.items}
                  pathname={normalizedPathname}
                />
              </div>
            )}
          </React.Fragment>
        )
      )}
    </div>
  ) : null;
}

function ScrollableAccordionContent({
  children,
  className,
  ...props
}: React.ComponentProps<typeof AccordionContent>) {
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const accordionRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(() => {
    const element = contentRef.current;
    if (!element) return;

    const { clientHeight, scrollHeight, scrollTop } = element;
    setShowTopIndicator(scrollTop > 5);
    setShowBottomIndicator(scrollTop < scrollHeight - clientHeight - 5);
  }, []);

  const checkScrollState = React.useCallback(() => {
    const element = contentRef.current;
    if (!element) return;

    const { clientHeight, scrollHeight, scrollTop } = element;
    setShowTopIndicator(scrollTop > 5);
    setShowBottomIndicator(scrollTop < scrollHeight - clientHeight - 5);
  }, []);

  React.useEffect(() => {
    const element = contentRef.current;
    if (!element) return;

    // Check initial state
    checkScrollState();

    // Watch for content size changes to update scroll indicators
    const resizeObserver = new ResizeObserver(() => {
      checkScrollState();
    });
    resizeObserver.observe(element);

    element.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkScrollState);

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollState);
    };
  }, [handleScroll, checkScrollState, children]);

  return (
    <div className="relative flex grow flex-col overflow-y-hidden">
      <div ref={contentRef} className="grow overflow-y-auto">
        <AccordionContent ref={accordionRef} className="pb-1" {...props}>
          {children}
        </AccordionContent>
      </div>

      {/* Top scroll indicator */}
      {showTopIndicator && (
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex h-8 items-start justify-center bg-gradient-to-b from-background via-background/60 to-transparent pt-1">
          <ChevronDown className="size-3.5 rotate-180 text-muted-foreground" />
        </div>
      )}

      {/* Bottom scroll indicator */}
      {showBottomIndicator && (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex h-8 items-end justify-center bg-gradient-to-t from-background via-background/60 to-transparent pb-1">
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
