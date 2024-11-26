import { cn } from '@udecode/cn';

import { SiteHeader } from '@/components/site-header';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/40 dark:border-border" data-wrapper="">
      <div
        className={cn(
          'mx-auto w-full border-border/40 dark:border-border'
          // '[@media(width>=1800px)]:max-w-screen-2xl [@media(width>=1800px)]:border-x'
        )}
      >
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
