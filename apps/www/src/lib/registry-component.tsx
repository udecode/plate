import * as React from 'react';

import { Index } from '@/__registry__';

export function getRegistryComponent(name: string) {
  if (name === 'plate-to-html') {
    return React.lazy(() => import('@/registry/blocks/plate-to-html/page'));
  }

  return Index[name]?.component;
}
