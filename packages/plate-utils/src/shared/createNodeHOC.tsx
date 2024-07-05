import React from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-core';
import type { Value } from '@udecode/slate';

export const createNodeHOC =
  <V extends Value, T>(HOC: React.FC<T>) =>
  (Component: any, props: Omit<T, keyof PlateRenderElementProps<V>>) =>
    function hoc(childrenProps: PlateRenderElementProps<V>) {
      return (
        <HOC {...({ ...childrenProps, ...props } as T)}>
          <Component {...childrenProps} />
        </HOC>
      );
    };
