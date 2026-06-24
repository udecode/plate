import * as React from 'react';

import { Index } from '@/__registry__';

export function getRegistryComponent(name: string) {
  if (name === 'plite-to-html') {
    return React.lazy(() => import('@/registry/blocks/slate-to-html/page'));
  }

  return Index[name]?.component;
}
