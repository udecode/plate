import React from 'react';

import type { TEditor, TElement } from '@udecode/plate-common/server';
import type { DropTargetMonitor } from 'react-dnd';

import { type DragItemNode, type DropLineDirection, useDndBlock } from '..';

export type DraggableState = {
  dragRef: (
    elementOrNode: Element | React.ReactElement | React.RefObject<any> | null
  ) => void;
  dropLine: DropLineDirection;
  isDragging: boolean;
  isHovered: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
  setIsHovered: (isHovered: boolean) => void;
};

export const useDraggableState = (props: {
  element: TElement;
  onDropHandler?: (
    editor: TEditor,
    props: {
      dragItem: DragItemNode;
      id: string;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
    }
  ) => boolean;
}): DraggableState => {
  const { element, onDropHandler } = props;

  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const { dragRef, dropLine, isDragging } = useDndBlock({
    id: element.id as string,
    nodeRef,
    onDropHandler,
  });

  return {
    dragRef,
    dropLine,
    isDragging,
    isHovered,
    nodeRef,
    setIsHovered,
  };
};

export const useDraggable = (state: DraggableState) => {
  return {
    droplineProps: {
      contentEditable: false,
    },
    groupProps: {
      onPointerEnter: () => state.setIsHovered(true),
      onPointerLeave: () => state.setIsHovered(false),
    },
    gutterLeftProps: {
      contentEditable: false,
    },
    handleRef: state.dragRef,
    previewRef: state.nodeRef,
  };
};
