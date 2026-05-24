import Link from 'next/link';

import { ModeSwitcher } from '@/components/mode-switcher';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { getSidebarNavFromPageTree } from '@/lib/docs-page-tree';

import { CommandMenu } from './command-menu';
import { Icons } from './icons';
import { LanguagesDropdownMenu } from './languages-dropdown-menu';
import { Logo } from './logo';
import { MainNav } from './main-nav';
import { SetupMCPDialog } from './mcp-dialog';
import { MobileNav } from './mobile-nav';

export function SiteHeader() {
  const sidebarNav = getSidebarNavFromPageTree();
  const mainNavItems = [
    {
      href: '/',
      title: 'Home',
      titleCn: '首页',
    },
    ...siteConfig.navItems.map((item) => ({
      href: item.href,
      title: item.label,
      titleCn: item.labelCn,
    })),
    {
      href: siteConfig.links.platePro,
      external: true,
      title: 'Plate Plus',
      titleCn: 'Plate Plus',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper 3xl:fixed:px-0 px-6">
        <div className="**:data-[slot=separator]:!h-4 3xl:fixed:container flex h-(--header-height) items-center gap-2">
          <MobileNav
            className="flex lg:hidden"
            items={mainNavItems}
            tree={sidebarNav}
          />

          <Logo />
          <MainNav className="hidden lg:flex" items={siteConfig.navItems} />

          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu navItems={mainNavItems} sidebarNav={sidebarNav} />
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
  );
}
