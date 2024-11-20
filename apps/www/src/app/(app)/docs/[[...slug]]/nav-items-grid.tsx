'use client';

import { useState } from 'react';

import type { SidebarNavItem } from '@/types/nav';

import { cn } from '@udecode/cn';
import Link from 'next/link';

import { DocBreadcrumb } from '@/app/(app)/docs/[[...slug]]/doc-breadcrumb';
import { H3 } from '@/components/typography';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { getDocIcon } from '@/config/docs-icons';
import { categoryNavGroups, docSections } from '@/config/docs-utils';
import { Input } from '@/registry/default/plate-ui/input';

export function NavItemsGrid({
  category,
  showFilter = true,
}: {
  category: string;
  showFilter?: boolean;
}) {
  const [filter, setFilter] = useState('');
  const items: SidebarNavItem[] = (categoryNavGroups as any)[category];

  const filteredItems = showFilter
    ? items
        .map((group) => ({
          ...group,
          items: group.items?.filter(
            (item) =>
              item.title?.toLowerCase().includes(filter.toLowerCase()) ||
              item.description?.toLowerCase().includes(filter.toLowerCase())
          ),
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
            {group.title && <H3 className="mb-4">{group.title}</H3>}
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {group.items?.map((item) => {
                const Icon = getDocIcon(item, category);

                return (
                  <Link
                    key={item.href}
                    className="rounded-lg"
                    href={item.href!}
                  >
                    <Card className="h-full bg-muted/30 transition-shadow duration-200 hover:shadow-md">
                      <CardContent className="flex gap-2 p-2">
                        {Icon && (
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-white">
                            <Icon className="size-5 text-neutral-800" />
                          </div>
                        )}
                        <div className="space-y-0">
                          <CardTitle className="mt-0.5 line-clamp-1 text-base font-medium">
                            {item.title}
                          </CardTitle>
                          {item.description && (
                            <p className="line-clamp-1 text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
