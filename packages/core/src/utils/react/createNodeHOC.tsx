import React, { FunctionComponent } from 'react';
import { Value } from '../../../../slate-utils/src/slate/editor/TEditor';
import { PlateRenderElementProps } from '../../types/plate/PlateRenderElementProps';

export const createNodeHOC = <V extends Value, T>(
  HOC: FunctionComponent<T>
) => (Component: any, props: T) => (
  childrenProps: PlateRenderElementProps<V>
) => (
  <HOC {...childrenProps} {...props}>
    <Component {...childrenProps} />
  </HOC>
);
