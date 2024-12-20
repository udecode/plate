import React from 'react';

import type { TElement } from '@udecode/plate-common';

import { useEditorRef } from '@udecode/plate-common/react';

import { type UseDndNodeOptions, DRAG_ITEM_BLOCK, useDndNode } from '..';

export type DraggableState = {
  isDragging: boolean;
  /** The ref of the draggable element */
  previewRef: React.RefObject<HTMLDivElement>;
  /** The ref of the draggable handle */
  handleRef: (
    elementOrNode: Element | React.ReactElement | React.RefObject<any> | null
  ) => void;
};

export const useDraggable = (
  props: UseDndNodeOptions & { element: TElement }
): DraggableState => {
  const {
    element,
    orientation = 'vertical',
    type = DRAG_ITEM_BLOCK,
    onDropHandler,
  } = props;

  const editor = useEditorRef();

  const nodeRef = React.useRef<HTMLDivElement>(null);

  if (!editor.plugins.dnd) return {} as any;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { dragRef, isDragging } = useDndNode({
    id: element.id as string,
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
