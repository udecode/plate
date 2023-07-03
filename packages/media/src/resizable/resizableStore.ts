import { CSSProperties } from 'react';
import { SCOPE_ELEMENT, createAtomStore } from '@udecode/plate-common';

export const { resizableStore, useResizableStore } = createAtomStore(
  {
    width: 0 as CSSProperties['width'],
  },
  { name: 'resizable', scope: SCOPE_ELEMENT }
);
