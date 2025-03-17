'use client';

import { LanguagesIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/registry/default/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/default/plate-ui/dropdown-menu';

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
          <div
            className="m-0 w-full cursor-pointer"
            onClick={() => handleClick()}
          >
            English
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <div
            className="w-full cursor-pointer"
            onClick={() => handleClick('cn')}
          >
            中文
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
