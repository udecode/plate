import React, { FunctionComponent } from 'react';
import { PlateRenderElementProps } from '../../types/PlateRenderElementProps';

export const createNodeHOC = <T,>(HOC: FunctionComponent<T>) => (
  Component: any,
  props: T
) => (childrenProps: PlateRenderElementProps) => (
  <HOC {...childrenProps} {...props}>
    <Component {...childrenProps} />
  </HOC>
);
