import React from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-core';
import { DraggableState } from './useDraggableState';

export type DraggableRootProps = {} & HTMLPropsAs<'div'> &
  Pick<DraggableState, 'rootRef'>;

export const useDraggableRootProps = ({
  rootRef,
  ...props
}: DraggableRootProps): HTMLPropsAs<'div'> => {
  return {
    ...props,
    ref: useComposedRef<HTMLDivElement>(props.ref, rootRef),
  };
};

export const DraggableRoot = createComponentAs<DraggableRootProps>((props) => {
  const htmlProps = useDraggableRootProps(props);

  return createElementAs('div', htmlProps);
});
