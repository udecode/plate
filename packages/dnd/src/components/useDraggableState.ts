import React, { useRef } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { TElement } from '@udecode/plate-core';
import { useDndBlock } from '../hooks';
import { DropLineDirection } from '../types';

export type DraggableState = {
  dropLine: DropLineDirection;
  isDragging: boolean;
  rootRef: React.RefObject<HTMLDivElement>;
  dragRef: ConnectDragSource;
};

export const useDraggableState = (props: {
  element: TElement;
}): DraggableState => {
  const { element } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const { dropLine, isDragging, dragRef } = useDndBlock({
    id: element.id as string,
    nodeRef: rootRef,
  });

  return { dropLine, isDragging, rootRef, dragRef };
};
