import React, { FunctionComponent } from 'react';
import { Value } from '@udecode/slate-utils';
import { PlateRenderElementProps } from '../../../core/src/types/plate/PlateRenderElementProps';

export const createNodeHOC = <V extends Value, T>(
  HOC: FunctionComponent<T>
) => (Component: any, props: T) => (
  childrenProps: PlateRenderElementProps<V>
) => (
  <HOC {...childrenProps} {...props}>
    <Component {...childrenProps} />
  </HOC>
);
