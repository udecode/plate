import type React from 'react';

import { createAtomStore } from '@udecode/plate/react';

export const { ResizableProvider, resizableStore, useResizableStore } =
  createAtomStore(
    {
      width: 0 as React.CSSProperties['width'],
    },
    { name: 'resizable' }
  );
