'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';

import { Logo } from './icons/Logo';
import { Badge } from './ui/badge';

export function MainNav() {
  const pathname = usePathname();
  const isUI = pathname?.includes('/docs/components');

  return (
    <div className="mr-4 hidden md:flex">
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Logo className="h-6 w-6" />
        <span className="hidden items-center font-bold sm:inline-flex">
          {siteConfig.name}
          <div className="flex w-8 items-center">
            {isUI && <Badge className="ml-1">UI</Badge>}
          </div>
        </span>
      </Link>
      <nav className="flex items-center gap-6 text-sm">
        <Link
          href="/docs"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/docs' ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          Docs
        </Link>
        <Link
          href="/docs/components"
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith('/docs/components')
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
        >
          Components
        </Link>
      </nav>
    </div>
  );
}
