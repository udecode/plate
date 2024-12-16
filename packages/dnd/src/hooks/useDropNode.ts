import {
  type DropTargetHookSpec,
  type DropTargetMonitor,
  useDrop,
} from 'react-dnd';

import type { TElement, TNodeEntry } from '@udecode/plate-common';
import type { PlateEditor } from '@udecode/plate-common/react';

import type {
  DragItemNode,
  ElementDragItemNode,
  FileDragItemNode,
} from '../types';

import { DndPlugin } from '../DndPlugin';
import { getDropPath, onDropNode } from '../transforms/onDropNode';
import { onHoverNode } from '../transforms/onHoverNode';

export type CanDropCallback = (args: {
  dragEntry: TNodeEntry<TElement>;
  dragItem: DragItemNode;
  dropEntry: TNodeEntry<TElement>;
  editor: PlateEditor;
}) => boolean;

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /** Id of the node. */
  id: string;

  /** The reference to the node being dragged. */
  nodeRef: any;

  /**
   * Intercepts the drop handling. If `false` is returned, the default drop
   * behavior is called after. If `true` is returned, the default behavior is
   * not called.
   */
  onDropHandler?: (
    editor: PlateEditor,
    props: {
      id: string;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
    }
  ) => boolean;

  canDropNode?: CanDropCallback;

  orientation?: 'horizontal' | 'vertical';
}

/**
 * `useDrop` hook to drop a node on the editor.
 *
 * On drop:
 *
 * - Get hover direction (top, bottom or undefined), return early if undefined
 * - DragPath: find node with id = dragItem.id, return early if not found
 * - Focus editor
 * - DropPath: find node with id = id, its path should be next (bottom) or
 *   previous (top)
 * - Move node from dragPath to dropPath
 *
 * On hover:
 *
 * - Get drop line direction
 * - If differs from dropLine, setDropLine is called
 *
 * Collect:
 *
 * - IsOver: true if mouse is over the block
 */
export const useDropNode = (
  editor: PlateEditor,
  {
    id,
    canDropNode,
    nodeRef,
    orientation,
    onDropHandler,
    ...options
  }: UseDropNodeOptions
) => {
  return useDrop<DragItemNode, unknown, { isOver: boolean }>({
    collect: (monitor) => ({
      isOver: monitor.isOver({
        shallow: true,
      }),
    }),
    drop: (dragItem, monitor) => {
      // Don't call onDropNode if this is a file drop

      if (!(dragItem as ElementDragItemNode).id) {
        const result = getDropPath(editor, {
          id,
          canDropNode,
          dragItem: dragItem as any,
          monitor,
          nodeRef,
          orientation,
        });

        const onDropFiles = editor.getOptions(DndPlugin).onDropFiles;

        if (!result || !onDropFiles) return;

        return onDropFiles({
          id,
          dragItem: dragItem as FileDragItemNode,
          editor,
          monitor,
          nodeRef,
          target: result.to,
        });
      }

      const handled =
        !!onDropHandler &&
        onDropHandler(editor, {
          id,
          dragItem,
          monitor,
          nodeRef,
        });

      if (handled) return;

      onDropNode(editor, {
        id,
        dragItem: dragItem as ElementDragItemNode,
        monitor,
        nodeRef,
        orientation,
      });
    },
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      onHoverNode(editor, {
        id,
        canDropNode,
        dragItem: item,
        monitor,
        nodeRef,
        orientation,
      });
    },
    ...options,
  });
};
