'use client';

import * as React from 'react';

import type { MainNavItem } from '@/types/nav';
import type { DialogProps } from '@radix-ui/react-dialog';

import { CommandMenuDialog } from '@/components/command-menu-dialog';
import { Button } from '@/components/ui/button';
import {
  preloadSidebarNav,
  useLazySidebarNav,
} from '@/hooks/use-lazy-sidebar-nav';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

const i18n = {
  cn: {
    searchDocumentation: '搜索文档...',
    searchShort: '搜索...',
  },
  en: {
    searchDocumentation: 'Search documentation...',
    searchShort: 'Search...',
  },
};

const getHydratedSnapshot = () => true;
const getServerSnapshot = () => false;
const subscribeHydration = () => () => {};

export function CommandMenu({
  navItems,
  ...props
}: Omit<DialogProps, 'onOpenChange' | 'open'> & {
  navItems: MainNavItem[];
}) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const [open, setOpen] = React.useState(false);
  const isHydrated = React.useSyncExternalStore(
    subscribeHydration,
    getHydratedSnapshot,
    getServerSnapshot
  );
  const openRef = React.useRef(open);
  const { sidebarNav } = useLazySidebarNav(locale, open);

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  const updateOpen = React.useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);

      if (!nextOpen) {
        return;
      }

      preloadSidebarNav(locale);
    },
    [locale]
  );

  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        !(
          (event.key === 'k' && (event.metaKey || event.ctrlKey)) ||
          event.key === '/'
        )
      ) {
        return;
      }

      if (
        (event.target instanceof HTMLElement &&
          event.target.isContentEditable) ||
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      event.preventDefault();
      updateOpen(!openRef.current);
    };

    document.addEventListener('keydown', down);

    return () => document.removeEventListener('keydown', down);
  }, [updateOpen]);

  return (
    <>
      <Button
        data-command-menu-trigger
        disabled={!isHydrated}
        variant="outline"
        className={cn(
          'relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 text-foreground shadow-none transition-colors hover:bg-muted/50 md:w-48 lg:w-40 xl:w-64 dark:bg-card'
        )}
        onClick={() => updateOpen(true)}
        {...props}
      >
        <span className="hidden xl:inline-flex">
          {content.searchDocumentation}
        </span>
        <span className="inline-flex xl:hidden">{content.searchShort}</span>
      </Button>

      <CommandMenuDialog
        navItems={navItems}
        open={open}
        sidebarNav={sidebarNav}
        onOpenChange={updateOpen}
      />
    </>
  );
}
