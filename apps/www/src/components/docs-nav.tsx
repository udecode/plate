'use client';

import React, { Suspense, useState } from 'react';

import type { DocsConfig } from '@/config/docs';
import type { SidebarNavItem } from 'types/nav';

import { cn } from '@udecode/cn';
import { castArray } from 'lodash';
import { Leaf, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useLocale } from '@/hooks/useLocale';
import { hrefWithLocale } from '@/lib/withLocale';
import { Input } from '@/registry/default/plate-ui/input';

export function DocsNav({ config }: { config: DocsConfig }) {
  const pathname = usePathname();
  const [filter, setFilter] = useState('');

  const sidebarNav = pathname?.includes('/docs/components')
    ? config.componentsNav
    : config.sidebarNav;

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
            : section.items?.filter(({ keywords = [], ...item }) => {
                return (
                  item.title?.toLowerCase().includes(lowercasedFilter) ||
                  [...keywords, ...castArray(item.label)].some((label) =>
                    label?.toLowerCase().includes(lowercasedFilter)
                  )
                );
              }),
        };
      })
      .filter((section) => section.items && section.items.length > 0);
  }, [sidebarNav, filter]);

  return sidebarNav.length > 0 ? (
    <div className="relative w-[calc(100%-1rem)]">
      <div className="sticky top-0 z-10 flex w-full items-center bg-background/95 px-2 pb-3 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
        <div className="relative mt-3 flex w-full items-center">
          <Input
            className={cn(
              'h-8 w-full rounded-lg bg-muted/50 px-3 py-1 text-sm text-muted-foreground shadow-none focus-visible:ring-transparent'
            )}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
          />
          {filter && (
            <button
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setFilter('')}
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      <Accordion
        className="flex flex-col gap-6"
        defaultValue={filteredNav.map((_, i) => `item-${i}`)}
        type="multiple"
      >
        {filteredNav.map((item, index) => {
          const isAccordion = ['Examples', 'Plugins'].includes(item.title!);

          if (isAccordion) {
            return (
              <AccordionItem
                key={index}
                className="mb-4 border-none px-2"
                value={`item-${index}`}
              >
                <AccordionTrigger className="py-1 text-sm font-semibold outline-none">
                  <div className="flex items-center">
                    {item.title}
                    {item.label && (
                      <div className="flex gap-1">
                        {castArray(item.label).map((label, labelIndex) => (
                          <span
                            key={labelIndex}
                            className={cn(
                              'ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none font-medium text-foreground',
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
                  <AccordionContent className="mt-1">
                    {item?.items?.length && (
                      <DocsNavItems items={item.items} pathname={pathname} />
                    )}
                  </AccordionContent>
                </Suspense>
              </AccordionItem>
            );
          }

          return (
            <div key={index} className="flex flex-col gap-1">
              <h4 className="rounded-md px-2 py-1 text-sm font-semibold">
                {item.title}
                {item.label && (
                  <div className="ml-2 flex gap-1">
                    {castArray(item.label).map((label, labelIndex) => (
                      <span
                        key={labelIndex}
                        className={cn(
                          'rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none font-medium text-foreground',
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
              </h4>
              {item?.items?.length && (
                <Suspense fallback={null}>
                  <DocsNavItems items={item.items} pathname={pathname} />
                </Suspense>
              )}
            </div>
          );
        })}
      </Accordion>
    </div>
  ) : null;
}

function DocsNavItems({
  className,
  items,
  pathname,
}: {
  items: SidebarNavItem[];
  pathname: string | null;
  className?: string;
}) {
  const locale = useLocale();

  return items?.length ? (
    <div
      className={cn(
        'grid grid-flow-row auto-rows-max gap-0.5 text-sm',
        className
      )}
    >
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <React.Fragment key={index}>
            <Link
              className={cn(
                'group relative flex h-8 w-full items-center rounded-lg px-2 after:absolute after:inset-x-0 after:inset-y-[-2px] after:rounded-lg hover:bg-accent hover:text-accent-foreground',
                item.disabled && 'cursor-not-allowed opacity-60',
                pathname === item.href
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'font-normal text-foreground'
              )}
              href={hrefWithLocale(item.href, locale)}
              rel={item.external ? 'noreferrer' : ''}
              target={item.external ? '_blank' : ''}
            >
              {item.title}
              {item.label && (
                <div className="ml-2 flex gap-1">
                  {castArray(item.label).map((label, labelIndex) => (
                    <span
                      key={labelIndex}
                      className={cn(
                        'rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none font-medium text-foreground',
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
              {item.title?.toLowerCase().includes('leaf') && (
                <Leaf className="ml-auto size-4 text-foreground/80" />
              )}
            </Link>
            {item.items?.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                className={cn(
                  'group flex h-8 w-full items-center rounded-lg px-6 font-normal text-foreground underline-offset-2 hover:bg-accent hover:text-accent-foreground',
                  subItem.disabled && 'cursor-not-allowed opacity-60',
                  pathname === subItem.href &&
                    'bg-accent font-medium text-accent-foreground'
                )}
                href={hrefWithLocale(subItem.href!, locale)}
                rel={subItem.external ? 'noreferrer' : ''}
                target={subItem.external ? '_blank' : ''}
              >
                {subItem.title}
                {subItem.label && (
                  <div className="ml-2 flex gap-1">
                    {castArray(subItem.label).map((label, labelIndex) => (
                      <span
                        key={labelIndex}
                        className={cn(
                          'rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none font-medium text-foreground',
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
            ))}
          </React.Fragment>
        ) : (
          <span
            key={index}
            className={cn(
              'flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground hover:underline',
              item.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            {item.title}
            {item.label && (
              <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground no-underline group-hover:no-underline">
                {item.label}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null;
}
