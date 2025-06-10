import { Suspense } from 'react';

import { SiteHeader } from '@/components/site-header';
import { cn } from '@/lib/utils';

// SYNC

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/40 dark:border-border" data-wrapper="">
      <div
        className={cn(
          'mx-auto h-full w-full border-border/40 dark:border-border'
          // '[@media(width>=1800px)]:max-w-(--breakpoint-2xl) [@media(width>=1800px)]:border-x'
        )}
      >
        <Suspense fallback={null}>
          <SiteHeader />
        </Suspense>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
