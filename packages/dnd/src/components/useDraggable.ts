import React from 'react';

import { useEditorRef } from 'platejs/react';

import { type UseDndNodeOptions, DRAG_ITEM_BLOCK, useDndNode } from '..';

export type DraggableState = {
  /** True when the element is ready to be dragged (e.g., on mouse down but before drag starts) */
  isAboutToDrag: boolean;
  isDragging: boolean;
  /** The ref of the draggable element */
  nodeRef: React.RefObject<HTMLDivElement | null>;
  /** The ref of the multiple preview element */
  previewRef: React.RefObject<HTMLDivElement | null>;
  /** The ref of the draggable handle */
  handleRef: (
    elementOrNode:
      | Element
      | React.ReactElement<any>
      | React.RefObject<any>
      | null
  ) => void;
};

export const useDraggable = (props: UseDndNodeOptions): DraggableState => {
  const {
    orientation = 'vertical',
    type = DRAG_ITEM_BLOCK,
    onDropHandler,
  } = props;

  const editor = useEditorRef();

  const nodeRef = React.useRef<HTMLDivElement>(null);

  const multiplePreviewRef = React.useRef<HTMLDivElement>(null);

  if (!editor.plugins.dnd) return {} as any;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { dragRef, isAboutToDrag, isDragging } = useDndNode({
    multiplePreviewRef,
    nodeRef,
    orientation,
    type,
    onDropHandler,
    ...props,
  });

  return {
    isAboutToDrag,
    isDragging,
    nodeRef,
    previewRef: multiplePreviewRef,
    handleRef: dragRef,
  };
};
