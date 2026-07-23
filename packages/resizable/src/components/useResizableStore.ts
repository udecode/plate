import type React from 'react';

import { createAtomStore } from '@platejs/core/react/internal';

export const {
  ResizableProvider,
  resizableStore,
  useResizableSet,
  useResizableStore,
  useResizableValue,
} = createAtomStore(
  {
    width: 0 as React.CSSProperties['width'],
  },
  { name: 'resizable' }
) as any;
