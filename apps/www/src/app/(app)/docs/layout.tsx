'use client';

import { Suspense } from 'react';

import { DocsNav } from '@/components/docs-nav';
import { docsConfig } from '@/config/docs';
import { cn } from '@/lib/utils';

// SYNC

type DocsLayoutProps = {
  children: React.ReactNode;
};

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <div
        className={cn(
          '3xl:fixed:container min-h-min flex-1 items-start 3xl:fixed:px-3 px-0 [--sidebar-width:220px] [--top-spacing:0] md:grid md:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] md:[--sidebar-width:240px] md:[--top-spacing:calc(var(--spacing)*4)]',
          'md:gap-4 lg:gap-6 xl:gap-10'
        )}
      >
        <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="scrollbar-hide h-full overflow-auto">
            <Suspense fallback={null}>
              <DocsNav config={docsConfig} />
            </Suspense>
          </div>
        </aside>

        <div className="size-full">{children}</div>
      </div>
    </div>
  );
}
