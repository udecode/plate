/* eslint-disable turbo/no-undeclared-env-vars */
import { cn } from '@udecode/cn';
import Link from 'next/link';

import { siteConfig } from '@/config/site';
import ModeToggle from '@/registry/default/example/mode-toggle';
import { buttonVariants } from '@/registry/default/plate-ui/button';

import { CommandMenu } from './command-menu';
import { Icons } from './icons';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';

export function SiteHeader() {
  // const { stargazers_count: count } = await fetch(
  //   'https://api.github.com/repos/udecode/plate',
  //   {
  //     ...(process.env.GITHUB_OAUTH_TOKEN && {
  //       headers: {
  //         Authorization: `Bearer ${process.env.GITHUB_OAUTH_TOKEN}`,
  //         'Content-Type': 'application/json',
  //       },
  //     }),
  //     next: {
  //       revalidate: 3600,
  //     },
  //   }
  // )
  //   .then((res) => res.json())
  //   .catch(() => ({ stargazers_count: 0 }));

  // const count = 0;

  return (
    <header className="sticky top-0 z-[100] w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
        <MainNav />
        <MobileNav />

        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <Link
            className="text-foreground/60 transition-colors hover:text-foreground/80"
            href="/#playground"
          >
            Playground
          </Link>
          <Link
            className="text-foreground/60 transition-colors hover:text-foreground/80"
            href={siteConfig.links.potion}
          >
            Potion
          </Link>
        </nav>

        {/* <StarOnGithub count={count} /> */}
        <div className="flex items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div>
          <nav className="flex items-center">
            <Link
              className="inline"
              href={siteConfig.links.github}
              rel="noreferrer"
              target="_blank"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'size-8 px-0'
                )}
              >
                <Icons.gitHub className="size-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link
              href={siteConfig.links.discord}
              rel="noreferrer"
              target="_blank"
            >
              <div
                className={cn(
                  buttonVariants({
                    variant: 'ghost',
                  }),
                  'size-8 px-0'
                )}
              >
                <Icons.discord className="size-4 fill-current" />
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
