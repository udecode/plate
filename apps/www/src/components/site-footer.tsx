'use client';

import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

export function SiteFooter() {
  const pathname = usePathname()?.replace(/^\/cn(?=\/|$)/, '') || '/';

  if (pathname === '/docs' || pathname.startsWith('/docs/')) return null;

  return (
    <footer
      className={cn(
        pathname === '/' && 'bg-muted',
        pathname === '/editors' || pathname.startsWith('/editors/')
          ? 'bg-surface/40'
          : 'dark:bg-transparent',
        '3xl:fixed:bg-transparent'
      )}
    >
      <div className="container-wrapper px-4 xl:px-6">
        <div className="flex h-(--footer-height) items-center justify-center">
          <p className="px-1 text-center text-sm leading-loose text-muted-foreground">
            <span>From </span>
            <a
              className="font-medium underline underline-offset-4"
              href={siteConfig.links.twitter}
              rel="noreferrer"
              target="_blank"
            >
              {siteConfig.author}
            </a>
            <span>. The source code is available on </span>
            <a
              className="font-medium underline underline-offset-4"
              href={siteConfig.links.github}
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <span>.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
