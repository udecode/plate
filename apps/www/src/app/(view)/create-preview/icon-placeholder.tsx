'use client';

import * as React from 'react';

import type { IconLibrary } from '@/lib/registry-icon-placeholder';

const Hugeicons = React.lazy(
  () => import('@/__registry__/create-preview/icons/hugeicons')
);
const Lucide = React.lazy(
  () => import('@/__registry__/create-preview/icons/lucide')
);
const Phosphor = React.lazy(
  () => import('@/__registry__/create-preview/icons/phosphor')
);
const Remixicon = React.lazy(
  () => import('@/__registry__/create-preview/icons/remixicon')
);
const Tabler = React.lazy(
  () => import('@/__registry__/create-preview/icons/tabler')
);

export const IconLibraryContext = React.createContext<IconLibrary>('lucide');

export function IconPlaceholder({
  hugeicons,
  lucide,
  phosphor,
  remixicon,
  tabler,
  ...props
}: Omit<React.ComponentProps<typeof Lucide>, 'name'> & {
  hugeicons: React.ComponentProps<typeof Hugeicons>['name'];
  lucide: React.ComponentProps<typeof Lucide>['name'];
  phosphor: React.ComponentProps<typeof Phosphor>['name'];
  remixicon: React.ComponentProps<typeof Remixicon>['name'];
  tabler: React.ComponentProps<typeof Tabler>['name'];
}) {
  const library = React.use(IconLibraryContext);

  return (
    <React.Suspense fallback={<svg height={24} width={24} {...props} />}>
      {library === 'hugeicons' && <Hugeicons {...props} name={hugeicons} />}
      {library === 'lucide' && <Lucide {...props} name={lucide} />}
      {library === 'phosphor' && <Phosphor {...props} name={phosphor} />}
      {library === 'remixicon' && <Remixicon {...props} name={remixicon} />}
      {library === 'tabler' && <Tabler {...props} name={tabler} />}
    </React.Suspense>
  );
}
