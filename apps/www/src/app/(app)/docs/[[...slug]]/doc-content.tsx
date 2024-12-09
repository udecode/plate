'use client';

import React from 'react';
import Balancer from 'react-wrap-balancer';

import type { TableOfContents } from '@/lib/toc';
import type { RegistryEntry } from '@/registry/schema';

import { cn } from '@udecode/cn';
import { ChevronRight, ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

import { DocBreadcrumb } from '@/app/(app)/docs/[[...slug]]/doc-breadcrumb';
import { OpenInPlus } from '@/components/open-in-plus';
import { DocsPager } from '@/components/pager';
import { DashboardTableOfContents } from '@/components/toc';
import { badgeVariants } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { categoryNavGroups, docSections } from '@/config/docs-utils';
import { getDocTitle, getRegistryTitle } from '@/lib/registry-utils';
import { Button } from '@/registry/default/plate-ui/button';

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

const searchCategories = {
  api: 'Search API',
  component: 'Search components',
  example: 'Search examples',
  guide: 'Search guides',
  plugin: 'Search plugins',
};

export function DocContent({
  category,
  children,
  doc,
  toc,
  ...file
}: {
  category: 'api' | 'component' | 'example' | 'guide' | 'plugin';
  children: React.ReactNode;
  toc?: TableOfContents;
} & Omit<Partial<RegistryEntry>, 'category'>) {
  const title = doc?.title ?? getRegistryTitle(file);
  const hasToc = doc?.toc && toc;

  const items = categoryNavGroups[category];

  const docSection = docSections[0].items!.find(
    (item) => item.value === category
  );

  return (
    <main
      className={cn(
        'relative py-6 lg:gap-10 lg:py-8',
        hasToc && 'lg:grid lg:grid-cols-[1fr_230px]'
      )}
    >
      <div className="w-full min-w-0">
        <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
          {category === 'guide' ? (
            <DocBreadcrumb
              value={category}
              placeholder="Search"
              combobox={false}
              items={docSections}
            />
          ) : (
            <Link href={docSection!.href!}>
              <Button variant="ghost">{docSection!.title}</Button>
            </Link>
          )}
          <ChevronRight className="size-4" />
          <DocBreadcrumb
            value={doc?.slug || 'Introduction'}
            placeholder={searchCategories[category] ?? 'Search'}
            category={category}
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
          <div className="sticky top-20 -mt-6 flex h-[calc(100vh-100px)] flex-col pt-4">
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
