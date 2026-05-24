'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { getLocalizedPath, useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

import { Icons } from './icons';

const i18n = {
  cn: {
    platePlus: 'Plate Plus',
  },
  en: {
    platePlus: 'Plate Plus',
  },
};

type MainNavConfigItem = {
  href: string;
  label: string;
  labelCn?: string;
};

export function MainNav({
  className,
  items,
  ...props
}: React.ComponentProps<'nav'> & {
  items: MainNavConfigItem[];
}) {
  const pathname = usePathname();
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <nav className={cn('items-center gap-0.5', className)} {...props}>
      {items.map((item) => {
        const href = getLocalizedPath(locale, item.href);

        return (
          <Button key={item.href} asChild size="sm" variant="ghost">
            <Link
              className={cn(
                (pathname === href ||
                  (href !== '/' && pathname?.startsWith(href))) &&
                  'text-primary'
              )}
              href={href}
            >
              {locale === 'cn' ? item.labelCn || item.label : item.label}
            </Link>
          </Button>
        );
      })}

      <Button
        asChild
        size="sm"
        variant="ghost"
        className="relative gap-0.5 font-normal"
      >
        <Link href={siteConfig.links.platePro}>
          {content.platePlus}
          <Icons.arrowUpRight className="-mt-2.5 size-2.5 text-muted-foreground" />
        </Link>
      </Button>
    </nav>
  );
}
