import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend';

import type { ConnectDragSource, DropTargetMonitor } from 'react-dnd';

import React from 'react';
import { type PlateEditor, useEditor } from '@platejs/core/react';

import type { DragItemNode } from '../types';

import { DRAG_ITEM_BLOCK } from '../DndPlugin';
import { type UseDragNodeOptions, useDragNode } from './useDragNode';
import { type UseDropNodeOptions, useDropNode } from './useDropNode';

export type UseDndNodeOptions = Pick<UseDropNodeOptions, 'element'> &
  Partial<Pick<UseDropNodeOptions, 'canDropNode' | 'nodeRef'>> &
  Partial<Pick<UseDragNodeOptions, 'type'>> & {
    /** Options passed to the drag hook. */
    drag?: Partial<Omit<UseDragNodeOptions, 'type'>>;
    /** Options passed to the drop hook, excluding element, nodeRef. */
    drop?: Partial<
      Omit<UseDropNodeOptions, 'canDropNode' | 'element' | 'nodeRef'>
    >;
    /** Orientation of the drag and drop interaction. */
    orientation?: 'horizontal' | 'vertical';
    preview?: {
      /** Whether to disable the preview. */
      disable?: boolean;
      /** The reference to the preview element. */
      ref?: React.RefObject<HTMLElement | null>;
    };
    /** The reference to the multiple preview element. */
    multiplePreviewRef?: React.RefObject<HTMLElement | null>;
    onDropHandler?: (
      editor: PlateEditor,
      props: {
        id: string;
        dragItem: DragItemNode;
        monitor: DropTargetMonitor<DragItemNode, unknown>;
        nodeRef: React.RefObject<HTMLElement | null>;
      }
    ) => boolean | void;
  };

/**
 * {@link useDragNode} and {@link useDropNode} hooks to drag and drop a node from
 * the editor. A default preview is used to show the node being dragged, which
 * can be customized or removed. Returns the drag ref and drop line direction.
 */
export const useDndNode = ({
  canDropNode,
  drag: dragOptions,
  drop: dropOptions,
  element,
  multiplePreviewRef,
  nodeRef,
  orientation = 'vertical',
  preview: previewOptions = {},
  type = DRAG_ITEM_BLOCK,
  onDropHandler,
}: UseDndNodeOptions): {
  dragRef: ConnectDragSource;
  isAboutToDrag: boolean;
  isDragging: boolean;
  isOver: boolean;
} => {
  const editor = useEditor();
  const fallbackNodeRef = React.useRef<HTMLElement>(null);
  const resolvedNodeRef = nodeRef ?? fallbackNodeRef;

  const [{ isAboutToDrag, isDragging }, dragRef, preview] = useDragNode(
    editor,
    {
      element,
      type,
      ...dragOptions,
    }
  );

  const [{ isOver }, drop] = useDropNode(editor, {
    accept: [type, NativeTypes.FILE],
    canDropNode,
    element,
    nodeRef: resolvedNodeRef,
    orientation,
    onDropHandler,
    ...dropOptions,
  });

  // Always use nodeRef for the drop target (actual DOM element)
  drop(resolvedNodeRef);

  // Handle preview based on options and whether we're dragging multiple nodes
  if (previewOptions.disable) {
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewOptions.ref) {
    preview(previewOptions.ref);
  } else {
    preview(multiplePreviewRef ?? null);
  }

  return {
    dragRef,
    isAboutToDrag,
    isDragging,
    isOver,
  };
};
