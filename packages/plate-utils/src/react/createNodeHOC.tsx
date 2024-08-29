import React from 'react';

import type { PlateRenderElementProps } from '@udecode/plate-core/react';

export const createNodeHOC =
  <T,>(HOC: React.FC<T>) =>
  (Component: any, props: Omit<T, keyof PlateRenderElementProps>) =>
    function hoc(childrenProps: PlateRenderElementProps) {
      return (
        <HOC {...({ ...childrenProps, ...props } as T)}>
          <Component {...childrenProps} />
        </HOC>
      );
    };
