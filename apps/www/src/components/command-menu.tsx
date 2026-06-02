'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

import type { MainNavItem } from '@/types/nav';
import type { DialogProps } from '@radix-ui/react-dialog';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  preloadSidebarNav,
  useLazySidebarNav,
} from '@/hooks/use-lazy-sidebar-nav';
import { useLocale } from '@/hooks/useLocale';
import { cn } from '@/lib/utils';

let commandMenuDialogPromise:
  | Promise<typeof import('./command-menu-dialog')>
  | undefined;

function loadCommandMenuDialog() {
  commandMenuDialogPromise ??= import('./command-menu-dialog');

  return commandMenuDialogPromise;
}

const LazyCommandMenuDialog = dynamic(
  () => loadCommandMenuDialog().then((module) => module.CommandMenuDialog),
  {
    loading: () => null,
    ssr: false,
  }
);

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

export function CommandMenu({
  navItems,
  ...props
}: Omit<DialogProps, 'onOpenChange' | 'open'> & {
  navItems: MainNavItem[];
}) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];
  const [open, setOpen] = React.useState(false);
  const [isDialogReady, setIsDialogReady] = React.useState(false);
  const [shouldRenderDialog, setShouldRenderDialog] = React.useState(false);
  const openRef = React.useRef(open);
  const { sidebarNav } = useLazySidebarNav(locale, shouldRenderDialog);

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  const warmCommandMenu = React.useCallback(() => {
    void loadCommandMenuDialog().then(() => {
      setIsDialogReady(true);
      setShouldRenderDialog(true);
    });
    preloadSidebarNav(locale);
  }, [locale]);

  React.useEffect(() => {
    const scheduleIdle =
      window.requestIdleCallback ??
      ((callback: IdleRequestCallback) =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 0,
            }),
          1500
        ));
    const cancelIdle =
      window.cancelIdleCallback ??
      ((handle: number) => window.clearTimeout(handle));
    const handle = scheduleIdle(warmCommandMenu, { timeout: 3000 });

    return () => cancelIdle(handle);
  }, [warmCommandMenu]);

  const updateOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        warmCommandMenu();
        setShouldRenderDialog(true);
      }

      setOpen(nextOpen);
    },
    [warmCommandMenu]
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
        variant="outline"
        className={cn(
          'relative h-8 w-full justify-start rounded-lg border-none bg-muted pl-3 text-foreground shadow-none transition-colors hover:bg-muted/50 md:w-48 lg:w-40 xl:w-64 dark:bg-card'
        )}
        onClick={() => updateOpen(true)}
        onFocus={warmCommandMenu}
        onPointerDown={warmCommandMenu}
        onPointerEnter={warmCommandMenu}
        {...props}
      >
        <span className="hidden xl:inline-flex">
          {content.searchDocumentation}
        </span>
        <span className="inline-flex xl:hidden">{content.searchShort}</span>
      </Button>

      {shouldRenderDialog ? (
        isDialogReady ? (
          <LazyCommandMenuDialog
            navItems={navItems}
            open={open}
            sidebarNav={sidebarNav}
            onOpenChange={updateOpen}
          />
        ) : (
          <CommandMenuLoadingDialog open={open} onOpenChange={updateOpen} />
        )
      ) : null}
    </>
  );
}

function CommandMenuLoadingDialog({
  onOpenChange,
  open,
}: {
  onOpenChange: NonNullable<DialogProps['onOpenChange']>;
  open: boolean;
}) {
  const locale = useLocale();
  const content = i18n[locale as keyof typeof i18n];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[15%]! max-w-[calc(100%-2rem)] translate-y-0! overflow-hidden rounded-xl border-none bg-clip-padding p-2 pb-11 shadow-2xl ring-4 ring-neutral-200/80 sm:max-w-lg dark:bg-neutral-900 dark:ring-neutral-800 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>Search documentation.</DialogDescription>
        </DialogHeader>
        <div className="flex h-9 items-center rounded-md border border-input bg-input/50 px-3 text-muted-foreground text-sm">
          {content.searchDocumentation}
        </div>
        <div className="flex min-h-80 items-center justify-center text-muted-foreground text-sm">
          Loading...
        </div>
      </DialogContent>
    </Dialog>
  );
}
