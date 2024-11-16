'use client';

import React from 'react';
import Balancer from 'react-wrap-balancer';

import type { TableOfContents } from '@/lib/toc';
import type { RegistryEntry } from '@/registry/schema';
import type { SidebarNavItem } from '@/types/nav';

import { cn } from '@udecode/cn';
import { ChevronRight, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

import { SearchableSelect } from '@/app/(app)/docs/[[...slug]]/searchable-select';
import { OpenInPlus } from '@/components/open-in-plus';
import { DocsPager } from '@/components/pager';
import { DashboardTableOfContents } from '@/components/toc';
import { badgeVariants } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  apiNavItems,
  componentGuidesNavItems,
  componentNavGroups,
  examplesNavItems,
  guidesNavItems,
  overviewNavItems,
  pluginsNavItems,
} from '@/config/docs';
import { getDocTitle, getRegistryTitle } from '@/lib/registry-utils';

// import { formatBytes, getPackageData } from '@/lib/bundlephobia';

const getItemVariant = (item: any) => {
  const allowedHosts = ['pro.platejs.org'];

  try {
    const url = new URL(item.route);

    if (allowedHosts.includes(url.hostname)) return 'plus';
  } catch (error) {
    // console.error('Invalid URL:', item.route, error);
  }

  // if (item.route?.includes('components')) return 'default';
  if (item.route?.includes('components')) return 'secondary';

  return 'outline';
};

const sections: SidebarNavItem[] = [
  {
    items: [
      { href: '/docs', title: 'Guide' },
      { href: '/docs/ai', title: 'Plugins' },
      { href: '/docs/examples/ai', title: 'Examples' },
      { href: '/docs/components/ai-leaf', title: 'Components' },
      { href: '/docs/api/common', title: 'API Reference' },
    ],
  },
];

export function DocContent({
  children,
  doc,
  isExample,
  isPlugin,
  isUI,
  toc,
  ...file
}: {
  children: React.ReactNode;
  isExample?: boolean;
  isPlugin?: boolean;
  isUI?: boolean;
  toc?: TableOfContents;
} & Partial<RegistryEntry>) {
  const title = doc?.title ?? getRegistryTitle(file);
  const hasToc = doc?.toc && toc;

  // Get the appropriate nav items based on the current section
  const getNavItems = (): SidebarNavItem[] => {
    if (isExample) return [{ items: examplesNavItems }];
    if (isPlugin) return [{ items: pluginsNavItems }];
    if (isUI) return componentNavGroups;
    if (doc?.slug?.includes('/api')) {
      return [{ items: apiNavItems }];
    }

    // Group guides into sections
    return [
      { items: overviewNavItems, title: 'Overview' },
      {
        items: [
          {
            href: '/docs/migration/slate-to-plate',
            title: 'From Slate to Plate',
          },
        ],
        title: 'Migration',
      },
      { items: guidesNavItems, title: 'Guides' },
      { items: componentGuidesNavItems, title: 'Components' },
    ];
  };

  const getPlaceholder = () => {
    if (isExample) return 'Search examples';
    if (isPlugin) return 'Search plugins';
    if (isUI) return 'Search components';
    if (doc?.slug?.includes('/api')) return 'Search API';

    return 'Search guide';
  };

  const items = getNavItems();

  const getCurrentSection = () => {
    if (isUI) return '/docs/components/ai-leaf';
    if (isExample) return '/docs/examples/ai';
    if (isPlugin) return '/docs/ai';
    if (doc?.slug?.includes('/api')) return '/docs/api/common';

    return '/docs';
  };

  return (
    <main
      className={cn(
        'relative py-6 lg:gap-10 lg:py-8',
        hasToc && 'lg:grid lg:grid-cols-[1fr_230px]'
      )}
    >
      <div className="mx-auto w-full min-w-0">
        <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
          <SearchableSelect
            value={getCurrentSection()}
            placeholder="Search"
            combobox={false}
            items={sections}
          />
          <ChevronRight className="size-4" />
          <SearchableSelect
            value={doc?.slug || 'Introduction'}
            placeholder={getPlaceholder()}
            items={items}
          />
        </div>
        <div className="space-y-2">
          <h1 className={cn('scroll-m-20 text-4xl font-bold tracking-tight')}>
            {title}
          </h1>
          {doc?.description && (
            <p className="text-lg text-muted-foreground">
              <Balancer>{doc?.description}</Balancer>
            </p>
          )}
        </div>
        {doc?.links || doc?.docs ? (
          <div className="flex flex-wrap items-center gap-1 pt-4">
            {doc?.links?.doc && (
              <Link
                className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}
                href={doc?.links.doc}
                rel="noreferrer"
                target="_blank"
              >
                Docs
                <ExternalLinkIcon className="size-3" />
              </Link>
            )}
            {doc?.links?.api && (
              <Link
                className={cn(badgeVariants({ variant: 'secondary' }), 'gap-1')}
                href={doc?.links.api}
                rel="noreferrer"
                target="_blank"
              >
                API Reference
                <ExternalLinkIcon className="size-3" />
              </Link>
            )}
            {doc?.docs?.map((item) => (
              <Link
                key={item.route}
                className={cn(
                  badgeVariants({
                    variant: getItemVariant(item),
                  })
                )}
                href={item.route as any}
                // rel={item.route?.includes('https') ? 'noreferrer' : undefined}
                // target={item.route?.includes('https') ? '_blank' : undefined}
              >
                {getDocTitle(item)}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="pb-12 pt-8">{children}</div>

        {doc && <DocsPager doc={doc as any} />}
      </div>

      {hasToc && (
        <div className="hidden text-sm lg:block">
          <div className="sticky top-16 -mt-10 flex h-[calc(100vh-84px)] flex-col pt-4">
            <ScrollArea className="grow pb-2">
              <div className="sticky top-0 flex w-[230px] flex-col">
                <DashboardTableOfContents toc={toc} />
              </div>
            </ScrollArea>
            <div className="mt-2 shrink-0">
              <OpenInPlus />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
