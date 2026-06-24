'use client';

import * as React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { getLocalizedPath, useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

type MainNavConfigItem = {
  external?: boolean;
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

  return (
    <nav className={cn('items-center gap-0', className)} {...props}>
      {items.map((item) => {
        const href = getLocalizedPath(locale, item.href);
        const isActive =
          item.href === '/docs'
            ? pathname === href ||
              (pathname?.startsWith(`${href}/`) &&
                !pathname.startsWith(`${href}/slate`))
            : pathname === href ||
              (href !== '/' && pathname?.startsWith(`${href}/`));

        return (
          <Button
            key={item.href}
            asChild
            size="sm"
            variant="ghost"
            className={cn('px-2.5', item.external && 'gap-0.5 font-normal')}
          >
            <Link
              className={cn(
                'relative items-center',
                isActive && 'text-primary'
              )}
              data-active={isActive}
              href={href}
              rel={item.external ? 'noreferrer' : undefined}
              target={item.external ? '_blank' : undefined}
            >
              {locale === 'cn' ? item.labelCn || item.label : item.label}
              {item.external && (
                <Icons.arrowUpRight
                  aria-hidden="true"
                  className="-mt-2.5 size-2.5 text-muted-foreground"
                />
              )}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
