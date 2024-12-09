'use client';

import { DocsSidebarNav } from '@/components/sidebar-nav';
import { docsConfig } from '@/config/docs';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:gap-10">
      {/* <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block"> */}
      <aside className="fixed top-14 z-30 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 border-r border-border/40 dark:border-border md:sticky md:block">
        <div className="h-full overflow-auto pb-4 scrollbar-hide">
          <DocsSidebarNav config={docsConfig} />
        </div>
      </aside>
      {children}
    </div>
  );
}
