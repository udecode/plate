import React, { useRef } from 'react';
import { ConnectDragSource, DropTargetMonitor } from 'react-dnd';
import { TEditor, TElement } from '@udecode/plate-common';
import { DragItemNode, DropLineDirection, useDndBlock } from '..';

export type DraggableState = {
  dropLine: DropLineDirection;
  isDragging: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
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

  const nodeRef = useRef<HTMLDivElement>(null);
  const { dropLine, isDragging, dragRef } = useDndBlock({
    id: element.id as string,
    nodeRef,
    onDropHandler,
  });

  return { dropLine, isDragging, nodeRef, dragRef };
};

export const useDraggable = (state: DraggableState) => {
  return {
    previewRef: state.nodeRef,
    handleRef: state.dragRef,
    droplineProps: {
      contentEditable: false,
    },
    gutterLeftProps: {
      contentEditable: false,
    },
  };
};
