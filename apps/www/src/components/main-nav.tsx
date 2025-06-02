'use client';

import * as React from 'react';

import type { SidebarNavItem } from '@/types/nav';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

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

export function MainNav({
  className,
  items,
  ...props
}: React.ComponentProps<'nav'> & {
  items: SidebarNavItem[];
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <nav className={cn('items-center gap-0.5', className)} {...props}>
      {items.map((item) => (
        <Button key={item.href} asChild size="sm" variant="ghost">
          <Link
            className={cn(pathname === item.href && 'text-primary')}
            href={item.href!}
          >
            {item.label}
          </Link>
        </Button>
      ))}

      <Button asChild size="sm" variant="ghost">
        <Link href={siteConfig.links.platePro}>
          {content.templates}
          <Icons.arrowUpRight className="absolute top-0 -right-3 size-2.5 text-muted-foreground" />
        </Link>
      </Button>
    </nav>
  );
}
