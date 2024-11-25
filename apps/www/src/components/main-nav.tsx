'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { Icons } from './icons';

export function MainNav() {
  const pathname = usePathname();
  const isUI = pathname?.includes('/docs/components');

  return (
    <div className="mr-4 hidden md:flex">
      <Link className="mr-4 flex items-center gap-2 lg:mr-6" href="/">
        <Icons.minus className="size-6" />
        <span className="hidden items-center font-bold lg:inline-flex">
          {siteConfig.name} {isUI && 'UI'}
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm xl:gap-6">
        <Link
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/docs'
              ? 'font-medium text-foreground'
              : 'text-foreground/80'
          )}
          href="/docs"
        >
          Docs
        </Link>
        <Link
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith('/docs/components')
              ? 'font-medium text-foreground'
              : 'text-foreground/80'
          )}
          href="/docs/components/introduction"
        >
          Components
        </Link>
        <Link
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith('/editors')
              ? 'font-medium text-foreground'
              : 'text-foreground/80'
          )}
          href="/editors"
        >
          Editors
        </Link>
        <Link
          className={cn(
            'relative text-foreground/80 transition-colors hover:text-foreground/80'
          )}
          href={siteConfig.links.platePro}
        >
          Templates
          <Icons.arrowUpRight className="absolute -right-3 top-0 size-2.5 text-muted-foreground" />
        </Link>
      </nav>
    </div>
  );
}
