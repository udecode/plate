import Link from 'next/link';

import { ModeSwitcher } from '@/components/mode-switcher';
import { Button } from '@/components/ui/button';
import { docsConfig } from '@/config/docs';
import { siteConfig } from '@/config/site';

import { CommandMenu } from './command-menu';
import { Icons } from './icons';
import { LanguagesDropdownMenu } from './languages-dropdown-menu';
import { Logo } from './logo';
import { MainNav } from './main-nav';
import { SetupMCPDialog } from './mcp-dialog';
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

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="**:data-[slot=separator]:!h-4 3xl:fixed:container flex h-(--header-height) items-center gap-2">
          {/* Mobile only */}
          <MobileNav
            className="flex md:hidden"
            items={docsConfig.mainNav}
            tree={docsConfig.sidebarNav}
          />

          {/* Desktop only */}
          <Logo />
          <MainNav className="hidden md:flex" items={siteConfig.navItems} />

          {/* Header end */}
          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu />
            </div>

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

            <Button
              size="icon"
              variant="ghost"
              className="size-8 px-0 max-md:hidden"
            >
              <Link
                href={siteConfig.links.discord}
                rel="noreferrer"
                target="_blank"
              >
                <Icons.discord className="size-4 fill-current" />
                <span className="sr-only">Discord</span>
              </Link>
            </Button>

            <LanguagesDropdownMenu />
            <ModeSwitcher />

            <SetupMCPDialog />
          </div>
        </div>
      </div>
    </header>

    // <header className="sticky top-0 z-50 w-full bg-background">
    //   <div className="container flex h-14 items-center justify-between px-4">
    //     <MainNav />
    //     <MobileNav />

    //     {/* <StarOnGithub count={count} /> */}
    //     <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
    //       <div className="w-full flex-1 md:w-auto md:flex-none">
    //         <CommandMenu />
    //       </div>
    //       <nav className="flex items-center gap-0.5">

    //
    //
    //
    //       </nav>
    //     </div>
    //   </div>
    // </header>
  );
}
