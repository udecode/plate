import React from 'react';

import type { TEditor, TElement } from '@udecode/plate-common';
import type { DropTargetMonitor } from 'react-dnd';

import { createAtomStore } from '@udecode/plate-common/react';

import { type DragItemNode, type DropLineDirection, useDndBlock } from '..';

export const { DraggableProvider, useDraggableStore } = createAtomStore(
  {
    dropLine: '' as DropLineDirection,
  },
  { name: 'draggable' }
);

export type DraggableState = {
  dragRef: (
    elementOrNode: Element | React.ReactElement | React.RefObject<any> | null
  ) => void;
  isDragging: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
};

export const useDraggableState = (props: {
  element: TElement;
  onDropHandler?: (
    editor: TEditor,
    props: {
      id: string;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
    }
  ) => boolean;
}): DraggableState => {
  const { element, onDropHandler } = props;

  const nodeRef = React.useRef<HTMLDivElement>(null);
  const { dragRef, isDragging } = useDndBlock({
    id: element.id as string,
    nodeRef,
    onDropHandler,
  });

  return {
    dragRef,
    isDragging,
    nodeRef,
  };
};

export const useDraggable = (state: DraggableState) => {
  return {
    previewRef: state.nodeRef,
    handleRef: state.dragRef,
  };
};

export const useDraggableGutter = () => {
  return {
    props: {
      contentEditable: false,
    },
  };
};

export const useDropLine = () => {
  const dropLine = useDraggableStore().get.dropLine();

  return {
    dropLine,
    props: {
      contentEditable: false,
    },
  };
};
