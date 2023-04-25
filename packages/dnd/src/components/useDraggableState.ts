import React, { useRef } from 'react';
import { ConnectDragSource, DropTargetMonitor } from 'react-dnd';
import { TEditor, TElement } from '@udecode/plate-common';
import { useDndBlock } from '../hooks';
import { DragItemNode, DropLineDirection } from '../types';

export type DraggableState = {
  dropLine: DropLineDirection;
  isDragging: boolean;
  rootRef: React.RefObject<HTMLDivElement>;
  dragRef: ConnectDragSource;
};

export const useDraggableState = (props: {
  element: TElement;
  onDropHandler?: (
    editor: TEditor,
    props: {
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      dragItem: DragItemNode;
      nodeRef: any;
      id: string;
    }
  ) => boolean;
}): DraggableState => {
  const { element, onDropHandler } = props;

  const rootRef = useRef<HTMLDivElement>(null);
  const { dropLine, isDragging, dragRef } = useDndBlock({
    id: element.id as string,
    nodeRef: rootRef,
    onDropHandler,
  });

  return { dropLine, isDragging, rootRef, dragRef };
};
