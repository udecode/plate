import Link from 'next/link';

import { GitHubLink } from '@/components/github-link';
import { ModeSwitcher } from '@/components/mode-switcher';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { siteConfig } from '@/config/site';
import { getSidebarNavFromPageTree } from '@/lib/docs-page-tree';

import { CommandMenu } from './command-menu';
import { Icons } from './icons';
import { LanguagesDropdownMenu } from './languages-dropdown-menu';
import { Logo } from './logo';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';

export function SiteHeader() {
  const sidebarNav = getSidebarNavFromPageTree();
  const commandNavItems = [
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
      title: 'Templates',
      titleCn: 'Templates',
    },
  ];
  const desktopNavItems = [
    ...siteConfig.navItems,
    {
      external: true,
      href: siteConfig.links.platePro,
      label: 'Templates',
      labelCn: 'Templates',
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="container-wrapper 3xl:fixed:px-0 px-6 group-has-data-[slot=designer]/layout:max-w-none">
        <div className="3xl:fixed:container flex h-(--header-height) items-center group-has-data-[slot=designer]/layout:fixed:max-w-none **:data-[slot=separator]:h-4!">
          <MobileNav
            className="flex lg:hidden"
            items={commandNavItems}
            tree={sidebarNav}
          />

          <Logo />
          <MainNav className="hidden lg:flex" items={desktopNavItems} />

          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <div className="hidden w-full flex-1 md:flex md:w-auto md:flex-none">
              <CommandMenu navItems={commandNavItems} sidebarNav={sidebarNav} />
            </div>

            <Separator
              orientation="vertical"
              className="ml-2 hidden lg:block"
            />

            <GitHubLink />

            <Separator orientation="vertical" />

            <Button
              asChild
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

            <Separator orientation="vertical" />
            <LanguagesDropdownMenu />
            <ModeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
