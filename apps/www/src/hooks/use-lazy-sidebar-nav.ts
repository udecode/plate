'use client';

import * as React from 'react';

import type { SidebarNavItem } from '@/types/nav';

type DocsLocale = 'cn' | 'en';

const sidebarNavCache = new Map<DocsLocale, SidebarNavItem[]>();
const sidebarNavPromises = new Map<DocsLocale, Promise<SidebarNavItem[]>>();

function normalizeLocale(locale: string): DocsLocale {
  return locale === 'cn' ? 'cn' : 'en';
}

function loadSidebarNav(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  const cached = sidebarNavCache.get(normalizedLocale);

  if (cached) {
    return Promise.resolve(cached);
  }

  const cachedPromise = sidebarNavPromises.get(normalizedLocale);

  if (cachedPromise) {
    return cachedPromise;
  }

  const promise = fetch(`/api/sidebar-nav?locale=${normalizedLocale}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load sidebar nav: ${response.status}`);
      }

      return response.json() as Promise<SidebarNavItem[]>;
    })
    .then((nav) => {
      sidebarNavCache.set(normalizedLocale, nav);
      sidebarNavPromises.delete(normalizedLocale);

      return nav;
    })
    .catch((error) => {
      sidebarNavPromises.delete(normalizedLocale);
      throw error;
    });

  sidebarNavPromises.set(normalizedLocale, promise);

  return promise;
}

export function preloadSidebarNav(locale: string) {
  void loadSidebarNav(locale).catch(() => {});
}

export function useLazySidebarNav(locale: string, enabled: boolean) {
  const normalizedLocale = normalizeLocale(locale);
  const [sidebarNav, setSidebarNav] = React.useState<SidebarNavItem[]>(
    () => sidebarNavCache.get(normalizedLocale) ?? []
  );

  React.useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    void loadSidebarNav(normalizedLocale)
      .then((nav) => {
        if (mounted) {
          setSidebarNav(nav);
        }
      })
      .catch(() => {
        if (mounted) {
          setSidebarNav([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, [enabled, normalizedLocale]);

  return {
    sidebarNav,
  };
}
