import React from 'react';
import { Value } from '@udecode/slate';

import type { PlateRenderElementProps } from '@udecode/plate-core';

export const createNodeHOC =
  <V extends Value, T>(HOC: React.FC<T>) =>
  (Component: any, props: T) =>
    function hoc(childrenProps: PlateRenderElementProps<V>) {
      return (
        <HOC {...childrenProps} {...props}>
          <Component {...childrenProps} />
        </HOC>
      );
    };
