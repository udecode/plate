'use client';

import React from 'react';

import type { TocItem } from '@/lib/toc';
import type { Doc } from 'contentlayer/generated';
import type { RegistryItem } from 'shadcn/registry';

import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { ExternalLinkIcon } from 'lucide-react';
import Link from 'next/link';

import { DocsTableOfContents } from '@/components/docs-toc';
import { LLMCopyButton } from '@/components/llm-copy-button';
import { OpenInPlus } from '@/components/open-in-plus';
import { getPagerForDoc } from '@/components/pager';
import { badgeVariants } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ViewOptions } from '@/components/view-options';
import { categoryNavGroups, docSections } from '@/config/docs-utils';
import { useDedupeNavItems } from '@/hooks/use-dedupe-nav-items';
import { getDocTitle, getRegistryTitle } from '@/lib/registry-utils';
import { cn } from '@/lib/utils';

// import { formatBytes, getPackageData } from '@/lib/bundlephobia';

const getItemVariant = (item: any) => {
  const allowedHosts = ['pro.platejs.org'];

  try {
    const url = new URL(item.route);

    if (allowedHosts.includes(url.hostname)) return 'plus';
  } catch (_error) {
    // console.error('Invalid URL:', item.route, error);
  }

  // if (item.route?.includes('components')) return 'default';
  if (item.route?.includes('components')) return 'secondary';

  return 'outline';
};

const _searchCategories = {
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
  doc: Partial<Doc>;
  toc?: TocItem[];
} & Partial<RegistryItem>) {
  const title = doc?.title ?? getRegistryTitle(file);
  const hasToc = doc?.toc && toc;

  const _docSection = docSections[0].items!.find(
    (item) => item.value === category
  );

  const _items = useDedupeNavItems(categoryNavGroups[category]);

  // v3
  const neighbours = getPagerForDoc(doc as any);

  return (
    <div className="relative flex items-stretch lg:w-full" data-slot="docs">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div
          className={cn(
            'mx-auto flex w-full min-w-0 flex-1 flex-col gap-8 px-4 py-6 text-neutral-800 lg:px-0 lg:py-8 dark:text-neutral-300'
            // v4
            // 'max-w-3xl'
          )}
        >
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <h1 className="scroll-m-20 font-semibold text-4xl tracking-tight sm:text-3xl lg:text-4xl">
                  {title}
                </h1>
                <div className="flex items-center gap-2 pt-1.5">
                  {neighbours.previous?.href && (
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="extend-touch-target size-8 shadow-none md:size-7"
                    >
                      <Link href={neighbours.previous.href}>
                        <IconArrowLeft />
                        <span className="sr-only">Previous</span>
                      </Link>
                    </Button>
                  )}
                  {neighbours.next?.href && (
                    <Button
                      asChild
                      size="icon"
                      variant="secondary"
                      className="extend-touch-target size-8 shadow-none md:size-7"
                    >
                      <Link href={neighbours.next.href}>
                        <span className="sr-only">Next</span>
                        <IconArrowRight />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
              {doc.description && (
                <p className="text-balance text-[1.05rem] text-muted-foreground sm:text-base">
                  {doc.description}
                </p>
              )}
            </div>

            {/* Copy Markdown and View Options */}
            {doc?.slug && doc?.body?.raw && (
              <div className="flex flex-row items-center gap-2">
                <LLMCopyButton
                  title={title}
                  content={doc.body.raw}
                  docUrl={`https://platejs.org${doc.slug}`}
                />
                <ViewOptions
                  title={title}
                  content={doc.body.raw}
                  docUrl={`https://platejs.org${doc.slug}`}
                />
              </div>
            )}

            {/* {links ? (
              <div className="flex items-center space-x-2 pt-4">
                {links?.doc && (
                  <Badge asChild variant="secondary">
                    <Link href={links.doc} rel="noreferrer" target="_blank">
                      Docs <IconArrowUpRight />
                    </Link>
                  </Badge>
                )}
                {links?.api && (
                  <Badge asChild variant="secondary">
                    <Link href={links.api} rel="noreferrer" target="_blank">
                      API Reference <IconArrowUpRight />
                    </Link>
                  </Badge>
                )}
              </div>
            ) : null} */}
            {doc?.links || doc?.docs ? (
              <div className="flex flex-wrap items-center gap-1">
                {doc?.links?.doc && (
                  <Link
                    className={cn(
                      badgeVariants({ variant: 'secondary' }),
                      'gap-1'
                    )}
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
                    className={cn(
                      badgeVariants({ variant: 'secondary' }),
                      'gap-1'
                    )}
                    href={doc?.links.api}
                    rel="noreferrer"
                    target="_blank"
                  >
                    API Reference
                    <ExternalLinkIcon className="size-3" />
                  </Link>
                )}
                {doc?.docs?.map((item: any) => (
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
          </div>
          <div className="w-full flex-1 *:data-[slot=alert]:first:mt-0">
            {/* <MDX components={mdxComponents} /> */}
            {children}
          </div>
        </div>
        <div
          className={cn(
            'mx-auto flex h-16 w-full items-center gap-2 px-4 lg:px-0',
            // v4
            // 'max-w-2xl',
            // no footer
            'mb-12'
          )}
        >
          {neighbours.previous?.href && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="shadow-none"
            >
              <Link href={neighbours.previous.href}>
                <IconArrowLeft /> {neighbours.previous.title}
              </Link>
            </Button>
          )}
          {neighbours.next?.href && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="ml-auto shadow-none"
            >
              <Link href={neighbours.next.href}>
                {neighbours.next.title} <IconArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {hasToc && (
        <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[calc(100svh-var(--header-height)-var(--footer-height))] w-72 flex-col gap-4 overflow-hidden overscroll-none pb-8 lg:flex">
          <div className="h-(--top-spacing) shrink-0" />
          {toc?.length ? (
            <div className="no-scrollbar overflow-y-auto px-8">
              <DocsTableOfContents toc={toc} />
              <div className="h-12" />
            </div>
          ) : null}
          <div className="flex flex-1 flex-col gap-12 px-6">
            <OpenInPlus />
          </div>
        </div>

        // <div className="hidden text-sm lg:block">
        //   <div className="sticky top-20 -mt-6 flex h-[calc(100vh-100px)] flex-col pt-4">
        //     <ScrollArea className="grow pb-2">
        //       <div className="sticky top-0 flex w-[230px] flex-col">
        //         <DashboardTableOfContents toc={toc} />
        //       </div>
        //     </ScrollArea>
        //     <div className="mt-2 shrink-0">
        //       <Suspense fallback={null}>
        //         <OpenInPlus />
        //       </Suspense>
        //     </div>
        //   </div>
        // </div>
      )}
    </div>
  );
}
