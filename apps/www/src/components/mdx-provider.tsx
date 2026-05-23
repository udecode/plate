'use client';

import type { ReactNode } from 'react';

import { Provider } from 'jotai';

import type { PackageInfoType } from '@/hooks/use-package-info';

import { packageInfoAtom } from '@/hooks/use-package-info';

import { HydrateAtoms } from './context/hydrate-atoms';

export function MdxProvider({
  children,
  packageInfo,
}: {
  children: ReactNode;
  packageInfo?: PackageInfoType;
}) {
  return (
    <div className="typography">
      <Provider>
        <HydrateAtoms initialValues={[[packageInfoAtom, packageInfo]]}>
          {children}
        </HydrateAtoms>
      </Provider>
    </div>
  );
}
