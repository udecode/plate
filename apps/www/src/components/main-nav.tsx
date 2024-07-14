'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';

import { Logo } from './icons/Logo';
import { Badge } from './ui/badge';

export function MainNav() {
  const pathname = usePathname();
  const isUI = pathname?.includes('/docs/components');

  return (
    <div className="mr-4 hidden md:flex">
      <Link className="mr-4 flex items-center space-x-2 lg:mr-6" href="/">
        <Logo className="size-6" />
        <span className="hidden items-center font-bold lg:inline-flex">
          {siteConfig.name}
          <div className="flex w-8 items-center">
            {isUI && <Badge className="ml-1">UI</Badge>}
          </div>
        </span>
      </Link>
      <nav className="flex items-center gap-4 text-sm lg:gap-6">
        <Link
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname === '/docs' ? 'text-foreground' : 'text-foreground/60'
          )}
          href="/docs"
        >
          Docs
        </Link>
        <Link
          className={cn(
            'transition-colors hover:text-foreground/80',
            pathname?.startsWith('/docs/components')
              ? 'text-foreground'
              : 'text-foreground/60'
          )}
          href="/docs/components"
        >
          Components
        </Link>
      </nav>
    </div>
  );
}
