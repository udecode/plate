'use client';

import React from 'react';

import type { DocsConfig } from '@/config/docs';
import type { SidebarNavItem } from '@/types/nav';

import { cn } from '@udecode/cn';
import { castArray } from 'lodash';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { parseAsString, useQueryState } from 'nuqs';

import { Input } from '@/registry/default/plate-ui/input';

export interface DocsSidebarNavProps {
  config: DocsConfig;
}

export function DocsSidebarNav({ config }: DocsSidebarNavProps) {
  const pathname = usePathname();
  const [filter, setFilter] = useQueryState(
    'q',
    parseAsString.withDefault('').withOptions({
      clearOnDefault: true,
    })
  );

  const sidebarNav = pathname?.includes('/docs/components')
    ? config.componentsNav
    : config.sidebarNav;

  const filteredNav = React.useMemo(() => {
    const lowercasedFilter = filter?.toLowerCase();

    return sidebarNav
      .map((section) => {
        const sectionMatches = section.title
          .toLowerCase()
          .includes(lowercasedFilter);

        return {
          ...section,
          items: sectionMatches
            ? section.items
            : section.items?.filter(({ keywords = [], ...item }) => {
                return (
                  item.title.toLowerCase().includes(lowercasedFilter) ||
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
      <div className="sticky top-0 z-10 mb-2 flex w-full items-center bg-background/95 px-2 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="relative flex w-full items-center">
          <Input
            className={cn(
              'h-8 w-full rounded-lg bg-muted/50 px-3 py-1 text-sm text-muted-foreground shadow-none'
            )}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
          />
          {filter && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setFilter('')}
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {filteredNav.map((item, index) => (
        <div key={index} className={cn('pb-4')}>
          <h4 className="mb-1 flex items-center rounded-md px-2 py-1 text-sm font-semibold">
            {item.title}
            {item.label && (
              <div className="ml-2 flex gap-1">
                {castArray(item.label).map((label, labelIndex) => (
                  <span
                    key={labelIndex}
                    className={cn(
                      'rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium leading-none text-foreground',
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
            <DocsSidebarNavItems items={item.items} pathname={pathname} />
          )}
        </div>
      ))}
    </div>
  ) : null;
}

interface DocsSidebarNavItemsProps {
  items: SidebarNavItem[];
  pathname: string | null;
}

export function DocsSidebarNavItems({
  items,
  pathname,
}: DocsSidebarNavItemsProps) {
  return items?.length ? (
    <div className="grid grid-flow-row auto-rows-max text-sm">
      {items.map((item, index) =>
        item.href && !item.disabled ? (
          <React.Fragment key={index}>
            <Link
              className={cn(
                'group flex w-full items-center rounded-md border border-transparent px-2 py-1',
                item.disabled && 'cursor-not-allowed opacity-60',
                pathname === item.href
                  ? 'font-medium text-foreground'
                  : 'text-muted-foreground'
              )}
              href={item.href}
              rel={item.external ? 'noreferrer' : ''}
              target={item.external ? '_blank' : ''}
            >
              <span className="whitespace-nowrap group-hover:underline">
                {item.title}
              </span>
              {item.label && (
                <div className="ml-2 flex gap-1 font-medium">
                  {castArray(item.label).map((label, labelIndex) => (
                    <span
                      key={labelIndex}
                      className={cn(
                        'rounded-md bg-secondary px-1.5 py-0.5 text-xs leading-none text-foreground',
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
            {item.items?.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                className={cn(
                  'group flex w-full items-center rounded-md border border-transparent px-6 py-1',
                  subItem.disabled && 'cursor-not-allowed opacity-60',
                  pathname === subItem.href
                    ? 'font-medium text-foreground'
                    : 'text-muted-foreground'
                )}
                href={subItem.href!}
                rel={subItem.external ? 'noreferrer' : ''}
                target={subItem.external ? '_blank' : ''}
              >
                <span className="whitespace-nowrap group-hover:underline">
                  {subItem.title}
                </span>
                {subItem.label && (
                  <span
                    className={cn(
                      'ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium leading-none text-foreground',
                      subItem.label === 'Plus' &&
                        'bg-primary text-background dark:text-background',
                      subItem.label === 'New' &&
                        'bg-[#adfa1d] dark:text-background'
                    )}
                  >
                    {subItem.label}
                  </span>
                )}
              </Link>
            ))}
          </React.Fragment>
        ) : (
          <span
            key={index}
            className={cn(
              'flex w-full cursor-not-allowed items-center rounded-md p-2 text-muted-foreground',
              item.disabled && 'cursor-not-allowed opacity-60'
            )}
          >
            <span className="whitespace-nowrap">{item.title}</span>
            {item.label && (
              <span className="ml-2 rounded-md bg-muted px-1.5 py-0.5 text-xs leading-none text-muted-foreground">
                {item.label}
              </span>
            )}
          </span>
        )
      )}
    </div>
  ) : null;
}
