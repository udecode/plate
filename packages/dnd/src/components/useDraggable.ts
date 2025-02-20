import React from 'react';

import { useEditorRef } from '@udecode/plate/react';

import { type UseDndNodeOptions, DRAG_ITEM_BLOCK, useDndNode } from '..';

export type DraggableState = {
  isDragging: boolean;
  /** The ref of the draggable element */
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

  if (!editor.plugins.dnd) return {} as any;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { dragRef, isDragging } = useDndNode({
    nodeRef,
    orientation,
    type,
    onDropHandler,
    ...props,
  });

  return {
    isDragging,
    previewRef: nodeRef,
    handleRef: dragRef,
  };
};
