import * as React from 'react';

import { Index } from '@/__registry__';

export function getRegistryComponent(name: string) {
  if (name === 'html-export') {
    return React.lazy(() => import('@/registry/blocks/html-export/page'));
  }

  return Index[name]?.component;
}
