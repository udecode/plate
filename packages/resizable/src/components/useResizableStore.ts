import React from 'react';
import { createAtomStore } from '@udecode/plate-common';

export const { resizableStore, useResizableStore, ResizableProvider } =
  createAtomStore(
    {
      width: 0 as React.CSSProperties['width'],
    },
    { name: 'resizable' }
  );
