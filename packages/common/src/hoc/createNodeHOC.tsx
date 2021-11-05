import React, { FunctionComponent } from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';

export const createNodeHOC = <T,>(HOC: FunctionComponent<T>) => (
  Component: any,
  props: T
) => (childrenProps: PlateRenderElementProps) => (
  <HOC {...childrenProps} {...props}>
    <Component {...childrenProps} />
  </HOC>
);
