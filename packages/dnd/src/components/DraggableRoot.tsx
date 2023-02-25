import React from 'react';
import { ConnectDragSource } from 'react-dnd';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useComposedRef,
} from '@udecode/plate-core';
import { DropLineDirection } from '../types';

export type DraggableRootProps = {} & HTMLPropsAs<'div'> &
  Pick<DraggableState, 'rootRef'>;
export type DraggableState = {
  dropLine: DropLineDirection;
  isDragging: boolean;
  rootRef: React.RefObject<HTMLDivElement>;
  dragRef: ConnectDragSource;
};
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
