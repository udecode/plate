/* eslint-disable turbo/no-undeclared-env-vars */
import Link from 'next/link';

import { ModeSwitcher } from '@/components/mode-switcher';
import { siteConfig } from '@/config/site';
import { Button } from '@/registry/default/plate-ui/button';

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
    <header className="sticky top-0 z-[51] w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div className="container flex h-14 items-center justify-between px-4">
        <MainNav />
        <MobileNav />

        {/* <nav className="hidden items-center gap-4 text-sm md:flex lg:gap-6">
          <Link
            className="text-foreground/60 transition-colors hover:text-foreground/80"
            href="/#playground"
          >
            Playground
          </Link>
          <Link
            className="text-foreground/60 transition-colors hover:text-foreground/80"
            href="/#potion"
            // href={siteConfig.links.potion}
          >
            Potion
          </Link>
        </nav> */}

        {/* <StarOnGithub count={count} /> */}
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <CommandMenu />
          </div>
          <nav className="flex items-center gap-0.5">
            <Button size="icon" variant="ghost" className="size-8 px-0">
              <Link
                className="inline"
                href={siteConfig.links.github}
                rel="noreferrer"
                target="_blank"
              >
                <Icons.gitHub className="size-4" />
                <span className="sr-only">GitHub</span>
              </Link>
            </Button>
            <Button size="icon" variant="ghost" className="size-8 px-0">
              <Link
                href={siteConfig.links.discord}
                rel="noreferrer"
                target="_blank"
              >
                <Icons.discord className="size-4 fill-current" />
                <span className="sr-only">Discord</span>
              </Link>
            </Button>
            <ModeSwitcher />
          </nav>
        </div>
      </div>
    </header>
  );
}
