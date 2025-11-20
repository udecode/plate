'use client';

import { useState } from 'react';

import type { SidebarNavItem } from '@/types/nav';

import { CircleDashedIcon } from 'lucide-react';
import Link from 'next/link';

import { DocBreadcrumb } from '@/app/(app)/docs/[[...slug]]/doc-breadcrumb';
import { Icons } from '@/components/icons';
import { H3 } from '@/components/typography';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getDocIcon } from '@/config/docs-icons';
import { categoryNavGroups, docSections } from '@/config/docs-utils';
import { useDedupeNavItems } from '@/hooks/use-dedupe-nav-items';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';
import { hrefWithLocale } from '@/lib/withLocale';

// Recursive function to flatten nested items
const flattenItems = (items: SidebarNavItem[]): SidebarNavItem[] => {
  const result: SidebarNavItem[] = [];

  for (const item of items) {
    if (item.href) {
      // Add the item itself if it has an href
      result.push(item);
    }

    // Recursively flatten nested items
    if (item.items?.length) {
      result.push(...flattenItems(item.items));
    }
  }

  return result;
};

// Recursive function to filter items including nested ones
const filterItems = (
  items: SidebarNavItem[],
  filter: string
): SidebarNavItem[] => {
  return items.reduce<SidebarNavItem[]>((acc, item) => {
    const itemMatches =
      item.title?.toLowerCase().includes(filter) ||
      item.description?.toLowerCase().includes(filter);

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
        ...item,
        ...(filteredNestedItems && { items: filteredNestedItems }),
      });
    }

    return acc;
  }, []);
};

export function NavItemCard({
  category,
  item,
}: {
  category: string;
  item: SidebarNavItem;
}) {
  const locale = useLocale();
  const Icon = getDocIcon(item, category) ?? CircleDashedIcon;
  return (
    <Link
      key={item.href}
      className="rounded-lg"
      href={hrefWithLocale(item.href!, locale)}
    >
      <Card className="h-full bg-muted/30 p-0 transition-shadow duration-200 hover:shadow-md">
        <CardContent className="flex gap-2 p-2">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-white">
            {/* eslint-disable-next-line react-hooks/static-components -- Icon selection based on item type is intentional */}
            <Icon className="size-5 text-neutral-800" />
          </div>
          <div className="space-y-0">
            <CardTitle className="mt-0.5 line-clamp-1 font-medium text-base">
              {item.title}
            </CardTitle>
            {item.description && (
              <p className="line-clamp-1 text-muted-foreground text-sm">
                {item.description}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function NavItemsGrid({
  category,
  showFilter = true,
}: {
  category: string;
  showFilter?: boolean;
}) {
  const [filter, setFilter] = useState('');
  const items = useDedupeNavItems((categoryNavGroups as any)[category]);

  const filteredItems = showFilter
    ? items
        .map((group) => ({
          ...group,
          items: group.items
            ? filterItems(group.items, filter.toLowerCase())
            : undefined,
        }))
        .filter((group) => group.items && group.items?.length > 0)
    : items;

  return (
    <div className="py-6 lg:py-8">
      <div className="mb-6 space-y-4">
        <div className="font-bold">
          <DocBreadcrumb
            value={category}
            placeholder="Search"
            items={docSections}
          />
        </div>
        {showFilter && (
          <Input
            className={cn(
              'h-10 max-w-sm rounded-lg bg-muted/50 px-3 py-1 text-base text-muted-foreground shadow-none focus-visible:ring-transparent'
            )}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter..."
          />
        )}
      </div>
      <div className="space-y-16">
        {filteredItems.map((group, index) => (
          <div key={index}>
            {group.title && (
              <div className="group relative">
                <H3
                  id={group.title.toLowerCase().replace(/ /g, '-')}
                  className="mb-4 scroll-mt-20"
                >
                  <a
                    className={cn(
                      'opacity-0 hover:opacity-100 group-hover:opacity-100'
                    )}
                    onClick={(e) => e.stopPropagation()}
                    href={`#${group.title.toLowerCase().replace(/ /g, '-')}`}
                  >
                    <div className="-left-5 -translate-y-1/2 absolute top-1/2 pr-1 leading-none">
                      <Icons.pragma className="size-4 text-muted-foreground" />
                    </div>
                  </a>
                  {group.title}
                </H3>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {group.items &&
                flattenItems(group.items).map((item) => (
                  <NavItemCard
                    key={item.href}
                    category={category}
                    item={item}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
