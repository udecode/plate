import React from 'react';

import type { PlateElementProps } from '@udecode/plate-core/react';

export const createNodeHOC =
  <T,>(HOC: React.FC<T>) =>
  (Component: any, props: Omit<T, keyof PlateElementProps>) =>
    function hoc(childrenProps: PlateElementProps) {
      return (
        <HOC {...({ ...childrenProps, ...props } as T)}>
          <Component {...childrenProps} />
        </HOC>
      );
    };
