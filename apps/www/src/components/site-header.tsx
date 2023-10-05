/* eslint-disable turbo/no-undeclared-env-vars */
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import ModeToggle from '@/registry/default/example/mode-toggle';
import { buttonVariants } from '@/registry/default/plate-ui/button';

import { CommandMenu } from './command-menu';
import { Icons } from './icons';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { StarOnGithub } from './star-on-github';

export async function SiteHeader() {
  const { stargazers_count: count } = await fetch(
    'https://api.github.com/repos/udecode/plate',
    {
      ...(process.env.GITHUB_OAUTH_TOKEN && {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_OAUTH_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }),
      next: {
        revalidate: 3600,
      },
    }
  )
    .then((res) => res.json())
    .catch(() => ({ stargazers_count: 0 }));

  return (
    <header className="supports-backdrop-blur:bg-background/60 sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <MainNav />
        <MobileNav />
        <StarOnGithub count={count} />
        <div className="flex items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div>
          <nav className="flex items-center">
            <Link
              className="inline md:hidden"
              href={siteConfig.links.github}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0'
                )}
              >
                <Icons.gitHub className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.discord}
              target="_blank"
              rel="noreferrer"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'w-9 px-0'
                )}
              >
                <Icons.discord className="h-4 w-4 fill-current" />
                <span className="sr-only">Discord</span>
              </div>
            </Link>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  );
}
