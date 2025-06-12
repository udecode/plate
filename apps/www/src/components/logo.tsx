'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { getLocalizedPath, useLocale } from '@/hooks/useLocale';

import { Icons } from './icons';

export function Logo() {
  const locale = useLocale();

  return (
    <Button
      asChild
      size="icon"
      variant="ghost"
      className="hidden size-8 md:flex"
    >
      <Link href={getLocalizedPath(locale, '/')}>
        <Icons.logo className="size-5" />
        <span className="sr-only">{siteConfig.name}</span>
      </Link>
    </Button>
  );
}
