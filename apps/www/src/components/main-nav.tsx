'use client';

import * as React from 'react';

import { cn } from '@udecode/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { getI18nContent } from '@/i18n/getI18nContent';

import { Icons } from './icons';

const i18n = {
  cn: {
    components: '组件',
    docs: '文档',
    editors: '编辑器',
    templates: '模板',
  },
  en: {
    components: 'Components',
    docs: 'Docs',
    editors: 'Editors',
    templates: 'Templates',
  },
};

export function MainNav() {
  const pathname = usePathname();
  const isUI = pathname?.includes('/docs/components');
  const content = getI18nContent(i18n);

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
          {content.docs}
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
          {content.components}
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
          {content.editors}
        </Link>
        <Link
          className={cn(
            'relative text-foreground/80 transition-colors hover:text-foreground/80'
          )}
          href={siteConfig.links.platePro}
        >
          {content.templates}
          <Icons.arrowUpRight className="absolute -right-3 top-0 size-2.5 text-muted-foreground" />
        </Link>
      </nav>
    </div>
  );
}
