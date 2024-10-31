'use client';

import { DocsSidebarNav } from '@/components/sidebar-nav';
import { ScrollArea } from '@/components/ui/scroll-area';
import { docsConfig } from '@/config/docs';

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="border-b">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-2 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 xl:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-full pb-4">
            <DocsSidebarNav config={docsConfig} />
          </ScrollArea>
        </aside>
        {children}
      </div>
    </div>
  );
}
