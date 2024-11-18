'use client';

import type { SidebarNavItem } from '@/types/nav';

import Link from 'next/link';

import { DocBreadcrumb } from '@/app/(app)/docs/[[...slug]]/doc-breadcrumb';
import { H3 } from '@/components/typography';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { DocIcons } from '@/config/docs-icons';
import { categoryNavGroups, docSections } from '@/config/docs-utils';

export function NavItemsGrid({ category }: { category: string }) {
  const items: SidebarNavItem[] = (categoryNavGroups as any)[category];

  return (
    <div className="py-6 lg:py-8">
      <div className="mb-6 font-bold">
        <DocBreadcrumb
          value={category}
          placeholder="Search"
          combobox={false}
          items={docSections}
        />
      </div>
      <div className="space-y-16">
        {items.map((group, index) => (
          <div key={index}>
            {group.title && <H3 className="mb-4">{group.title}</H3>}
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {group.items?.map((item) => {
                const icon = item.icon ?? item.href?.split('/').pop();
                const Icon = (DocIcons as any)[icon!];

                return (
                  <Link
                    key={item.href}
                    className="rounded-lg"
                    href={item.href!}
                  >
                    <Card className="h-full bg-muted/30 transition-shadow duration-200 hover:shadow-md">
                      <CardContent className="flex gap-2 p-2">
                        {Icon && (
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-background">
                            <Icon className="size-5" />
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
