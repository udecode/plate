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
    const supportedLocales = ['cn', 'pt-br'];

    if (!pathname) return;

    const segments = pathname.split('/').filter((p) => !!p);
    const currentLocale = supportedLocales.includes(segments[0])
      ? segments[0]
      : undefined;

    // If the target locale is the same as the current, do nothing
    if (locale === currentLocale) return;

    // Remove the current locale from the segments if it exists
    const newSegments = currentLocale ? segments.slice(1) : segments;

    if (locale) {
      url.pathname = `/${locale}/${newSegments.join('/')}`;
      url.searchParams.set('locale', locale);
    } else {
      url.pathname = `/${newSegments.join('/')}`;
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
        <DropdownMenuItem asChild>
         <button
            type="button"
            className="w-full cursor-pointer"
            onClick={() => handleClick('pt-br')}
          >
            Português
            <span className="text-xs text-muted-foreground">Beta</span>
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
