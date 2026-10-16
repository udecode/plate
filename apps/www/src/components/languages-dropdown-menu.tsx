'use client';

import { LanguagesIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { hasCnPage, hrefWithLocale } from '@/lib/withLocale';

const CN_PREFIX_REGEX = /^\/cn(?=\/|$)/;

export function LanguagesDropdownMenu() {
  const pathname = usePathname() ?? '/';

  const handleClick = (locale: 'cn' | 'en') => {
    const englishPath = pathname.replace(CN_PREFIX_REGEX, '') || '/';
    const target =
      locale === 'cn' && !hasCnPage(englishPath)
        ? hrefWithLocale('/', 'cn')
        : hrefWithLocale(englishPath, locale);

    if (target !== pathname) window.location.href = target;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-8 px-0">
          <LanguagesIcon className="size-4" />
          <span className="sr-only">Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-60 py-1">
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="m-0 w-full cursor-pointer"
            onClick={() => {
              handleClick('en');
            }}
          >
            English
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => {
              handleClick('cn');
            }}
          >
            中文
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
