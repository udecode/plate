import {
  type DropTargetHookSpec,
  type DropTargetMonitor,
  useDrop,
} from 'react-dnd';

import type { PlateEditor } from '@udecode/plate-common/react';

import type {
  DragItemNode,
  DropLineDirection,
  ElementDragItemNode,
  FileDragItemNode,
} from '../types';

import { DndPlugin } from '../DndPlugin';
import { getDropPath, onDropNode } from '../transforms/onDropNode';
import { onHoverNode } from '../transforms/onHoverNode';

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /** Id of the node. */
  id: string;

  /** Current value of dropLine. */
  dropLine: string;

  /** The reference to the node being dragged. */
  nodeRef: any;

  /** Callback called on dropLine change. */
  onChangeDropLine: (newValue: DropLineDirection) => void;
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
    dropLine,
    nodeRef,
    onChangeDropLine,
    onDropHandler,
    ...options
  }: UseDropNodeOptions
) => {
  return useDrop<DragItemNode, unknown, { isOver: boolean }>({
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    drop: (dragItem, monitor) => {
      // Don't call onDropNode if this is a file drop

      if (!(dragItem as ElementDragItemNode).id) {
        const result = getDropPath(editor, {
          id,
          dragItem: dragItem as any,
          monitor,
          nodeRef,
        });

        const onDropFiles = editor.getOptions(DndPlugin).onDropFiles;

        if (!result || !onDropFiles) return;

        return onDropFiles(editor, {
          id,
          dragItem: dragItem as FileDragItemNode,
          dropPath: result.to,
          monitor,
          nodeRef,
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
      });
    },
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      onHoverNode(editor, {
        id,
        dragItem: item,
        dropLine,
        monitor,
        nodeRef,
        onChangeDropLine,
      });
    },
    ...options,
  });
};
