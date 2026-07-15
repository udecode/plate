import React from 'react';

import { type UseDndNodeOptions, DRAG_ITEM_BLOCK, useDndNode } from '..';

export type DraggableState = {
  /**
   * True when the element is ready to be dragged (e.g., on mouse down but
   * before drag starts)
   */
  isAboutToDrag: boolean;
  isDragging: boolean;
  /** The ref of the draggable element */
  nodeRef: React.RefObject<HTMLDivElement | null>;
  /** The ref of the multiple preview element */
  previewRef: React.RefObject<HTMLDivElement | null>;
  /** The ref of the draggable handle */
  handleRef: React.RefCallback<HTMLElement>;
};

export const useDraggable = (props: UseDndNodeOptions): DraggableState => {
  const {
    orientation = 'vertical',
    type = DRAG_ITEM_BLOCK,
    onDropHandler,
  } = props;

  const nodeRef = React.useRef<HTMLDivElement>(null);

  const multiplePreviewRef = React.useRef<HTMLDivElement>(null);

  const { dragRef, isAboutToDrag, isDragging } = useDndNode({
    multiplePreviewRef,
    nodeRef,
    orientation,
    type,
    onDropHandler,
    ...props,
  });
  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      dragRef(node);
    },
    [dragRef]
  );

  return {
    isAboutToDrag,
    isDragging,
    nodeRef,
    previewRef: multiplePreviewRef,
    handleRef,
  };
};
