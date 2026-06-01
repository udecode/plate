import { Suspense, type CSSProperties } from 'react';

import { DocsNav } from '@/components/docs-nav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getSidebarNavFromPageTree } from '@/lib/docs-page-tree';

// Reuse the same layout as (app)/docs
export default function CNDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // CN docs fall back to English MDX; DocsNav localizes labels and hrefs.
  const sidebarNav = getSidebarNavFromPageTree();

  return (
    <div className="container-wrapper flex flex-1 flex-col px-2">
      <SidebarProvider
        className="3xl:fixed:container min-h-min flex-1 items-start 3xl:fixed:px-3 px-0 [--top-spacing:0] lg:grid lg:grid-cols-[var(--sidebar-width)_minmax(0,1fr)] lg:[--top-spacing:calc(var(--spacing)*4)]"
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
          } as CSSProperties
        }
      >
        <Suspense fallback={null}>
          <DocsNav sidebarNav={sidebarNav} />
        </Suspense>

        <div className="h-full w-full">{children}</div>
      </SidebarProvider>
    </div>
  );
}
