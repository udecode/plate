import { Suspense } from 'react';

import { SiteHeader } from '@/components/site-header';
import { cn } from '@/lib/utils';

// Reuse the same layout as (app)
export default function CNLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/40 dark:border-border" data-wrapper="">
      <div
        className={cn(
          'mx-auto h-full w-full border-border/40 dark:border-border'
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
