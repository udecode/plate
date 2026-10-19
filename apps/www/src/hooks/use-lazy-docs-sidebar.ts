'use client';

import * as React from 'react';

import type { DocsSidebar } from '@/lib/docs-sidebar';

type DocsLocale = 'cn' | 'en';

const sidebarCache = new Map<DocsLocale, DocsSidebar>();
const sidebarPromises = new Map<DocsLocale, Promise<DocsSidebar>>();

function normalizeLocale(locale: string): DocsLocale {
  return locale === 'cn' ? 'cn' : 'en';
}

function loadSidebar(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const cached = sidebarCache.get(normalizedLocale);

  if (cached) {
    return Promise.resolve(cached);
  }

  const cachedPromise = sidebarPromises.get(normalizedLocale);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = fetch(`/api/docs-sidebar?locale=${normalizedLocale}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load docs sidebar: ${response.status}`);
      }

      return response.json() as Promise<DocsSidebar>;
    })
    .then((sidebar) => {
      sidebarCache.set(normalizedLocale, sidebar);
      sidebarPromises.delete(normalizedLocale);

      return sidebar;
    })
    .catch((error: unknown) => {
      sidebarPromises.delete(normalizedLocale);
      throw error;
    });

  sidebarPromises.set(normalizedLocale, promise);

  return promise;
}

export function preloadDocsSidebar(locale: string) {
  void loadSidebar(locale).catch(() => {});
}

export function useLazyDocsSidebar(locale: string, enabled: boolean) {
  const normalizedLocale = normalizeLocale(locale);
  const [sidebar, setSidebar] = React.useState<DocsSidebar | undefined>(() =>
    sidebarCache.get(normalizedLocale)
  );

  React.useEffect(() => {
    if (!enabled) return undefined;

    let mounted = true;

    void loadSidebar(normalizedLocale)
      .then((nextSidebar) => {
        if (mounted) {
          setSidebar(nextSidebar);
        }
      })
      .catch(() => {
        if (mounted) {
          setSidebar(undefined);
        }
      });

    return () => {
      mounted = false;
    };
  }, [enabled, normalizedLocale]);

  return sidebar;
}
