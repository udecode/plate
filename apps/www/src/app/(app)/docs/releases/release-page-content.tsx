import type { ReactNode } from 'react';

import { IconRss } from '@tabler/icons-react';
import Link from 'next/link';

import { ReleaseIndex } from '@/components/release-index';
import { Button } from '@/components/ui/button';
import type { ReleaseIndexRelease } from '@/lib/releases';

export type ReleasePageSidebarLink = {
  href: string;
  label: string;
};

export function ReleasePageContent({
  after,
  description,
  releases,
  showMajorHeadings = false,
  sidebarLinks,
  title,
}: {
  after?: ReactNode;
  description?: string;
  releases: ReleaseIndexRelease[];
  showMajorHeadings?: boolean;
  sidebarLinks: ReleasePageSidebarLink[];
  title: string;
}) {
  return (
    <div
      className="flex scroll-mt-24 items-stretch pb-8 text-[1.05rem] sm:text-[15px] xl:w-full"
      data-slot="docs"
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="mx-auto flex w-full min-w-0 max-w-[56rem] flex-1 flex-col gap-6 px-4 py-6 text-foreground md:px-0 lg:py-8 dark:text-foreground">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="scroll-m-24 font-semibold text-3xl tracking-tight">
                {title}
              </h1>
              <Button
                asChild
                className="shadow-none"
                size="sm"
                variant="secondary"
              >
                <a href="/rss.xml" rel="noopener noreferrer" target="_blank">
                  <IconRss />
                  RSS
                </a>
              </Button>
            </div>
            {description ? (
              <p className="text-[1.05rem] text-muted-foreground sm:text-balance sm:text-base md:max-w-[80%]">
                {description}
              </p>
            ) : null}
          </div>
          <div className="w-full flex-1 pb-16 sm:pb-0">
            <ReleaseIndex
              releases={releases}
              showMajorHeadings={showMajorHeadings}
            />
            {after}
          </div>
        </div>
      </div>
      <div className="sticky top-[calc(var(--header-height)+1px)] z-30 ml-auto hidden h-[90svh] w-(--sidebar-width) flex-col gap-4 overflow-hidden overscroll-none pb-8 xl:flex">
        <div className="h-(--top-spacing) shrink-0" />
        <div className="no-scrollbar flex flex-col gap-8 overflow-y-auto px-8">
          <div className="flex flex-col gap-2 p-4 pt-0 text-sm">
            <p className="sticky top-0 h-6 bg-background font-medium text-muted-foreground text-xs">
              On This Page
            </p>
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                className="text-[0.8rem] text-muted-foreground no-underline transition-colors hover:text-foreground"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
