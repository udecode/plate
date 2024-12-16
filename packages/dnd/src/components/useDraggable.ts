import React from 'react';

import type { TElement } from '@udecode/plate-common';

import { type UseDndNodeOptions, DRAG_ITEM_BLOCK, useDndNode } from '..';

export type DraggableState = {
  dragRef: (
    elementOrNode: Element | React.ReactElement | React.RefObject<any> | null
  ) => void;
  isDragging: boolean;
  nodeRef: React.RefObject<HTMLDivElement>;
};

export const useDraggableState = (
  props: UseDndNodeOptions & { element: TElement }
): DraggableState => {
  const {
    element,
    orientation = 'vertical',
    type = DRAG_ITEM_BLOCK,
    onDropHandler,
  } = props;

  const nodeRef = React.useRef<HTMLDivElement>(null);

  const { dragRef, isDragging } = useDndNode({
    id: element.id as string,
    nodeRef,
    orientation,
    type,
    onDropHandler,
    ...props,
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
