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

export function LanguagesDropdownMenu() {
  const pathname = usePathname();

  const handleClick = (locale?: string) => {
    const url = new URL(window.location.href);

    if (locale) {
      if (pathname?.includes(locale)) {
        return;
      }

      url.pathname = `/${locale}${pathname}`;
      url.searchParams.set('locale', locale);
    } else {
      if (!pathname?.includes('cn')) return;
      if (pathname) {
        const segments = pathname.split('/').filter((p) => !!p);
        const newSegments = segments.filter((segment) => segment !== 'cn');
        url.pathname =
          newSegments.length > 0 ? `/${newSegments.join('/')}` : '/';
      }

      url.searchParams.delete('locale');
    }

    window.location.href = url.toString();
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
            onClick={() => handleClick()}
          >
            English
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => handleClick('cn')}
          >
            中文
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
