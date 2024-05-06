import type React from 'react';

import { createAtomStore } from '@udecode/plate-common';

export const { ResizableProvider, resizableStore, useResizableStore } =
  createAtomStore(
    {
      width: 0 as React.CSSProperties['width'],
    },
    { name: 'resizable' }
  );
