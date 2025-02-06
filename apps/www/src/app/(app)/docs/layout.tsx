'use client';

import { DocsNav } from '@/components/docs-nav';
import { docsConfig } from '@/config/docs';

// SYNC

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:gap-10">
      {/* <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block"> */}
      <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r border-border/40 md:sticky md:block dark:border-border">
        <div className="scrollbar-hide h-full overflow-auto pb-4">
          <DocsNav config={docsConfig} />
        </div>
      </aside>
      {children}
    </div>
  );
}
