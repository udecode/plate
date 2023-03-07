import React, { FunctionComponent } from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { Value } from '@udecode/slate';

export const createNodeHOC = <V extends Value, T>(
  HOC: FunctionComponent<T>
) => (Component: any, props: T) => (
  childrenProps: PlateRenderElementProps<V>
) => (
  <HOC {...childrenProps} {...props}>
    <Component {...childrenProps} />
  </HOC>
);
