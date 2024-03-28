import React from 'react';
import { TEditor, TElement } from '@udecode/plate-common';
import { DropTargetMonitor } from 'react-dnd';

import { DragItemNode, DropLineDirection, useDndBlock } from '..';

import type { ReactElement, RefObject } from 'react';

export type DraggableState = {
  dropLine: DropLineDirection;
  isHovered: boolean;
  setIsHovered: (isHovered: boolean) => void;
  isDragging: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
  dragRef: (
    elementOrNode: RefObject<any> | ReactElement | Element | null
  ) => void;
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

  const nodeRef = React.useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const { dropLine, isDragging, dragRef } = useDndBlock({
    id: element.id as string,
    nodeRef,
    onDropHandler,
  });

  return {
    dropLine,
    isHovered,
    setIsHovered,
    isDragging,
    nodeRef,
    dragRef,
  };
};

export const useDraggable = (state: DraggableState) => {
  return {
    previewRef: state.nodeRef,
    handleRef: state.dragRef,
    groupProps: {
      onPointerEnter: () => state.setIsHovered(true),
      onPointerLeave: () => state.setIsHovered(false),
    },
    droplineProps: {
      contentEditable: false,
    },
    gutterLeftProps: {
      contentEditable: false,
    },
  };
};
