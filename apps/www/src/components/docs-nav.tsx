'use client';

import React, { Suspense, useState } from 'react';

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
import {
  getLocalizedNavTitle,
  normalizeDocsHref,
} from '@/lib/docs-nav-metadata';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

function getLabelValues(label: SidebarNavItem['label']) {
  return castArray(label).filter(Boolean);
}

function getSearchTokens(item: SidebarNavItem) {
  return [
    item.title,
    item.titleCn,
    item.description,
    ...getLabelValues(item.label),
    ...(item.keywords ?? []),
  ]
    .filter((token): token is string => Boolean(token))
    .map((token) => token.toLowerCase());
}

function navItemMatches(item: SidebarNavItem, filter: string) {
  if (!filter) return true;

  return getSearchTokens(item).some((token) => token.includes(filter));
}

function filterNavItems(
  items: SidebarNavItem[],
  filter: string
): SidebarNavItem[] {
  return items.reduce<SidebarNavItem[]>((acc, item) => {
    const itemMatches = navItemMatches(item, filter);

    const filteredNestedItems = item.items
      ? itemMatches
        ? item.items
        : filterNavItems(item.items, filter)
      : undefined;

    if (
      itemMatches ||
      (filteredNestedItems && filteredNestedItems.length > 0)
    ) {
      acc.push({
        ...item,
        ...(filteredNestedItems && { items: filteredNestedItems }),
      });
    }

    return acc;
  }, []);
}

function hasActiveNestedItem(
  items: SidebarNavItem[],
  pathname: string
): boolean {
  return items.some((item) => {
    if (item.href && normalizeDocsHref(item.href) === pathname) return true;
    if (item.items?.length) {
      return hasActiveNestedItem(item.items, pathname);
    }

    return false;
  });
}

function getSectionValue(section: SidebarNavItem, index: number) {
  return section.href ?? section.title ?? `section-${index}`;
}

export function DocsNav({ sidebarNav }: { sidebarNav: SidebarNavItem[] }) {
  const locale = useLocale();
  const pathname = usePathname();
  const [filter, setFilter] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const activeItemRef = React.useRef<HTMLAnchorElement | null>(null);

  const normalizedPathname = React.useMemo(
    () => normalizeDocsHref(pathname ?? ''),
    [pathname]
  );

  const filteredNav = React.useMemo(() => {
    const lowercasedFilter = filter?.toLowerCase();

    return sidebarNav
      .map((section) => {
        const sectionMatches = navItemMatches(section, lowercasedFilter);

        return {
          ...section,
          items: sectionMatches
            ? section.items
            : section.items
              ? filterNavItems(section.items, lowercasedFilter)
              : undefined,
        };
      })
      .filter((section) => section.items && section.items.length > 0);
  }, [sidebarNav, filter]);

  const activeSectionValue = React.useMemo(() => {
    if (!normalizedPathname) return;

    const activeIndex = filteredNav.findIndex((section) =>
      section.items
        ? hasActiveNestedItem(section.items, normalizedPathname)
        : false
    );

    if (activeIndex === -1) return;

    return getSectionValue(filteredNav[activeIndex], activeIndex);
  }, [filteredNav, normalizedPathname]);

  const fallbackSectionValue = React.useMemo(() => {
    if (!filter || activeSectionValue || filteredNav.length === 0) return;

    return getSectionValue(filteredNav[0], 0);
  }, [activeSectionValue, filter, filteredNav]);

  const sectionValues = React.useMemo(
    () => filteredNav.map((section, index) => getSectionValue(section, index)),
    [filteredNav]
  );
  const accordionValue = sectionValues.includes(activeSection)
    ? activeSection
    : (activeSectionValue ?? fallbackSectionValue ?? '');

  React.useEffect(() => {
    const nextActiveSection = activeSectionValue ?? fallbackSectionValue;

    if (!nextActiveSection) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- Keep the active route or filtered results open when navigation changes.
    setActiveSection(nextActiveSection);
  }, [activeSectionValue, fallbackSectionValue]);

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
            placeholder={locale === 'cn' ? '筛选...' : 'Filter...'}
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
        value={accordionValue}
        onValueChange={setActiveSection}
        type="single"
        collapsible
      >
        {filteredNav.map((item, index) => {
          const sectionValue = getSectionValue(item, index);

          return (
            <AccordionItem
              key={sectionValue}
              className="flex flex-col overflow-y-hidden data-[state=closed]:shrink-0 data-[state=open]:grow"
              value={sectionValue}
            >
              <AccordionTrigger className="h-9 shrink-0 items-center px-2 py-1 text-sm outline-none">
                <div className="flex items-center">
                  {getLocalizedNavTitle(item, locale)}
                  {item.label && (
                    <div className="flex gap-1">
                      {getLabelValues(item.label).map((label, labelIndex) => (
                        <span
                          key={labelIndex}
                          className={cn(
                            'ml-2 rounded-md bg-secondary px-1.5 py-0.5 font-medium text-foreground text-xs leading-none',
                            label === 'Plus' &&
                              'bg-primary text-background dark:text-background',
                            label === 'New' &&
                              'bg-[#adfa1d] dark:text-background'
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
                <ScrollableAccordionContent
                  activeItemRef={activeItemRef}
                  isActiveSection={accordionValue === sectionValue}
                >
                  {item?.items?.length && (
                    <DocsNavItems
                      activeItemRef={activeItemRef}
                      items={item.items}
                      pathname={normalizedPathname}
                    />
                  )}
                </ScrollableAccordionContent>
              </Suspense>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  ) : null;
}

function DocsNavItems({
  className,
  depth = 0,
  items,
  pathname,
  activeItemRef,
}: {
  items: SidebarNavItem[];
  activeItemRef: React.RefObject<HTMLAnchorElement | null>;
  pathname: string | null;
  className?: string;
  depth?: number;
}) {
  const locale = useLocale();
  const normalizedPathname = normalizeDocsHref(pathname ?? '');

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
            {getLocalizedNavTitle(item, locale)}
            {item.label && (
              <div className="ml-2 flex gap-1">
                {getLabelValues(item.label).map((label, labelIndex) => (
                  <span
                    key={labelIndex}
                    className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground text-xs leading-none no-underline group-hover:no-underline"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </span>
        ) : (
          <React.Fragment key={index}>
            {item.href ? (
              <Link
                className={cn(
                  'group relative flex h-8 w-full items-center truncate whitespace-nowrap rounded-lg px-2 after:absolute after:inset-x-0 after:inset-y-[-2px] after:rounded-lg hover:bg-accent hover:text-accent-foreground',
                  item.disabled && 'cursor-not-allowed opacity-60',
                  normalizedPathname === normalizeDocsHref(item.href)
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'font-normal text-foreground'
                )}
                href={hrefWithLocale(item.href, locale)}
                ref={
                  normalizedPathname === normalizeDocsHref(item.href)
                    ? activeItemRef
                    : undefined
                }
                rel={item.external ? 'noreferrer' : ''}
                target={item.external ? '_blank' : ''}
              >
                {getLocalizedNavTitle(item, locale)}
                {item.label && (
                  <div className="ml-2 flex gap-1">
                    {getLabelValues(item.label).map((label, labelIndex) => (
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
              </Link>
            ) : (
              <span
                className={cn(
                  'flex h-8 w-full select-none items-center truncate rounded-lg px-2 font-medium text-foreground'
                )}
              >
                {getLocalizedNavTitle(item, locale)}
                {item.label && (
                  <div className="ml-2 flex gap-1">
                    {getLabelValues(item.label).map((label, labelIndex) => (
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
                  activeItemRef={activeItemRef}
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
  activeItemRef,
  children,
  className,
  isActiveSection,
  ...props
}: React.ComponentProps<typeof AccordionContent> & {
  activeItemRef: React.RefObject<HTMLAnchorElement | null>;
  isActiveSection: boolean;
}) {
  const [showTopIndicator, setShowTopIndicator] = useState(false);
  const [showBottomIndicator, setShowBottomIndicator] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

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

    checkScrollState();

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

  React.useEffect(() => {
    const element = contentRef.current;
    const activeElement = activeItemRef.current;

    if (!isActiveSection || !element || !activeElement) return;
    if (!element.contains(activeElement)) return;

    const frame = requestAnimationFrame(() => {
      const containerRect = element.getBoundingClientRect();
      const itemRect = activeElement.getBoundingClientRect();
      const top = element.scrollTop + itemRect.top - containerRect.top - 32;

      element.scrollTo({ top: Math.max(0, top) });
      checkScrollState();
    });

    return () => cancelAnimationFrame(frame);
  }, [activeItemRef, checkScrollState, isActiveSection, children]);

  return (
    <div className="relative flex grow flex-col overflow-y-hidden">
      <div ref={contentRef} className="grow overflow-y-auto">
        <AccordionContent className={cn('pb-1', className)} {...props}>
          {children}
        </AccordionContent>
      </div>

      {showTopIndicator && (
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 flex h-8 items-start justify-center bg-gradient-to-b from-background via-background/60 to-transparent pt-1">
          <ChevronDown className="size-3.5 rotate-180 text-muted-foreground" />
        </div>
      )}

      {showBottomIndicator && (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex h-8 items-end justify-center bg-gradient-to-t from-background via-background/60 to-transparent pb-1">
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
