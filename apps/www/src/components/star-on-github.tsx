'use client';

import { cn } from '@udecode/cn';
import { StarIcon } from 'lucide-react';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { buttonVariants } from '@/registry/default/plate-ui/button';

import { CountingNumbers } from './counting-numbers';
import { Icons } from './icons';

export function StarOnGithub({ count }: { count: number }) {
  return (
    <div className={cn('mx-2 hidden md:block', count > 0 && 'min-w-[225px]')}>
      <Link
        className={cn(
          buttonVariants(),
          'group relative flex w-full justify-start gap-2 overflow-hidden whitespace-pre rounded-sm',
          'dark:bg-muted dark:text-foreground',
          'hover:ring-2 hover:ring-primary hover:ring-offset-2',
          'transition-all duration-300 ease-out'
        )}
        href={siteConfig.links.github}
        target="_blank"
      >
        <span
          className={cn(
            'absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12',
            'bg-white opacity-10',
            'transition-all duration-1000 ease-out ',
            cn(
              count > 0
                ? 'group-hover:translate-x-[-181px]'
                : 'group-hover:translate-x-[-135px]'
            )
          )}
        />
        <Icons.gitHub className="size-4" />
        Star on GitHub
        <div className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          <StarIcon className="size-4 transition-all duration-300 group-hover:text-[#e3b341]" />

          {count > 0 && (
            <CountingNumbers
              className="font-medium text-background dark:text-foreground"
              noAnimation
              value={count}
            />
          )}
        </div>
      </Link>
    </div>
  );
}
