'use client';

import { LanguagesIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { siteConfig } from '@/config/site';
import { Button } from '@/registry/default/plate-ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/registry/default/plate-ui/dropdown-menu';

export function LanguagesDropdownMenu() {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-8 px-0">
          <LanguagesIcon className="size-4" />
          <span className="sr-only">Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[60] py-1">
        <DropdownMenuItem>
          <Link
            className="m-0 w-full cursor-pointer"
            href={`${siteConfig.languages.en}${pathname}`}
          >
            English
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link
            className="w-full cursor-pointer"
            href={`${siteConfig.languages.cn}${pathname}`}
          >
            中文
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
