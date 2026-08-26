'use client';

import * as React from 'react';

import type {
  PlateRegistryBase,
  PlateRegistryStyleName,
} from '@/lib/plate-registry-styles';

const SiteRegistryProviderContext = React.createContext<{
  base: PlateRegistryBase;
  style: PlateRegistryStyleName;
}>({
  base: 'radix',
  style: 'nova',
});

export function SiteRegistryProvider({
  base,
  children,
  style = 'nova',
}: React.PropsWithChildren<{
  base: PlateRegistryBase;
  style?: PlateRegistryStyleName;
}>) {
  const value = React.useMemo(() => ({ base, style }), [base, style]);

  return (
    <SiteRegistryProviderContext.Provider value={value}>
      {children}
    </SiteRegistryProviderContext.Provider>
  );
}

export function useSiteRegistryProvider() {
  return React.useContext(SiteRegistryProviderContext).base;
}

export function useSiteRegistryStyle() {
  return React.useContext(SiteRegistryProviderContext).style;
}
