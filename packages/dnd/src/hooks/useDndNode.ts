import { useEffect } from 'react';
import { NativeTypes, getEmptyImage } from 'react-dnd-html5-backend';

import type { DropTargetMonitor } from 'react-dnd';

import { type PlateEditor, useEditorRef } from '@udecode/plate-common/react';

import type { DragItemNode } from '../types';

import { DRAG_ITEM_BLOCK, DndPlugin } from '../DndPlugin';
import { type UseDragNodeOptions, useDragNode } from './useDragNode';
import { type UseDropNodeOptions, useDropNode } from './useDropNode';

export type UseDndNodeOptions = Partial<
  Pick<UseDropNodeOptions, 'canDropNode' | 'id' | 'nodeRef'>
> &
  Partial<Pick<UseDragNodeOptions, 'type'>> & {
    preview?: {
      /** Whether to disable the preview. */
      disable?: boolean;

      /** The reference to the preview element. */
      ref?: any;
    };

    /** Options passed to the drag hook. */
    drag?: Partial<Omit<UseDragNodeOptions, 'type'>>;

    /** Options passed to the drop hook, excluding id, nodeRef. */
    drop?: Partial<Omit<UseDropNodeOptions, 'canDropNode' | 'id' | 'nodeRef'>>;

    /** Orientation of the drag and drop interaction. */
    orientation?: 'horizontal' | 'vertical';

    onDropHandler?: (
      editor: PlateEditor,
      props: {
        id: string;
        dragItem: DragItemNode;
        monitor: DropTargetMonitor<DragItemNode, unknown>;
        nodeRef: any;
      }
    ) => boolean;
  };

/**
 * {@link useDragNode} and {@link useDropNode} hooks to drag and drop a node from
 * the editor. A default preview is used to show the node being dragged, which
 * can be customized or removed. Returns the drag ref and drop line direction.
 */
export const useDndNode = ({
  id = '',
  canDropNode,
  drag: dragOptions,
  drop: dropOptions,
  nodeRef,
  orientation = 'vertical',
  preview: previewOptions = {},
  type = DRAG_ITEM_BLOCK,
  onDropHandler,
}: UseDndNodeOptions) => {
  const editor = useEditorRef();
  const [{ isDragging }, dragRef, preview] = useDragNode(editor, {
    id,
    type,
    ...dragOptions,
  });

  const [{ isOver }, drop] = useDropNode(editor, {
    id,
    accept: [type, NativeTypes.FILE],
    canDropNode,
    nodeRef,
    orientation,
    onDropHandler,
    ...dropOptions,
  });

  if (previewOptions.disable) {
    drop(nodeRef);
    preview(getEmptyImage(), { captureDraggingState: true });
  } else if (previewOptions.ref) {
    drop(nodeRef);
    preview(previewOptions.ref);
  } else {
    preview(drop(nodeRef));
  }

  useEffect(() => {
    if (!isOver && editor.getOptions(DndPlugin).dropTarget?.id) {
      editor.setOption(DndPlugin, 'dropTarget', { id: null, line: '' });
    }
  }, [isOver, editor]);

  return {
    dragRef,
    isDragging,
    isOver,
  };
};
