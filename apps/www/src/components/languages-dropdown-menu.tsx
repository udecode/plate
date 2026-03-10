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
    let newPathname: string;

    if (locale === 'cn') {
      // Switch to Chinese - add /cn prefix if not present
      if (pathname?.startsWith('/cn')) {
        return; // Already on CN
      }
      newPathname = `/cn${pathname || '/'}`;
    } else {
      // Switch to English - remove /cn prefix
      if (!pathname?.startsWith('/cn')) {
        return; // Already on English
      }
      const segments = pathname.split('/').filter((p) => !!p && p !== 'cn');
      newPathname = segments.length > 0 ? `/${segments.join('/')}` : '/';
    }

    window.location.href = newPathname;
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
