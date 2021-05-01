import React, { FunctionComponent } from 'react';
import { SPRenderElementProps } from '@udecode/slate-plugins-core';

export const createNodeHOC = <T,>(HOC: FunctionComponent<T>) => (
  Component: any,
  props: T
) => (childrenProps: SPRenderElementProps) => (
  <HOC {...childrenProps} {...props}>
    <Component {...childrenProps} />
  </HOC>
);
