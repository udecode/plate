'use client';

import * as React from 'react';

import type { PlateRegistryBase } from '@/lib/plate-registry-styles';

const SiteRegistryProviderContext =
  React.createContext<PlateRegistryBase>('radix');

export function SiteRegistryProvider({
  base,
  children,
}: React.PropsWithChildren<{ base: PlateRegistryBase }>) {
  return (
    <SiteRegistryProviderContext.Provider value={base}>
      {children}
    </SiteRegistryProviderContext.Provider>
  );
}

export function useSiteRegistryProvider() {
  return React.useContext(SiteRegistryProviderContext);
}
