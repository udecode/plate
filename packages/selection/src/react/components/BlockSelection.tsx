import React from 'react';

import { BlockSelectionArea } from './BlockSelectionArea';
import { BlockStartArea } from './BlockStartArea';

export const BlockSelection = ({ children }: any) => {
  return (
    <BlockSelectionArea>
      <BlockStartArea
        state={{
          placement: 'left',
          // size: options.sizes?.left,
        }}
      />
      <BlockStartArea
        state={{
          placement: 'top',
          // size: options.sizes?.top,
        }}
      />
      <BlockStartArea
        state={{
          placement: 'right',
          // size: options.sizes?.right,
        }}
      />
      <BlockStartArea
        state={{
          placement: 'bottom',
          // size: options.sizes?.bottom,
        }}
      />
      {children}
    </BlockSelectionArea>
  );
};
