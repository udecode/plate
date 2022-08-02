import { CSSProperties } from 'react';
import { createAtomStore, SCOPE_ELEMENT } from '@udecode/plate-core';

export const { resizableStore, useResizableStore } = createAtomStore(
  {
    width: 0 as CSSProperties['width'],
  },
  { name: 'resizable', scope: SCOPE_ELEMENT }
);
