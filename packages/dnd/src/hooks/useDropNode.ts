import {
  type DropTargetHookSpec,
  type DropTargetMonitor,
  useDrop,
} from 'react-dnd';

import type { TEditor } from '@udecode/plate-common';

import type { DragItemNode, DropLineDirection } from '../types';

import { onDropNode } from '../transforms/onDropNode';
import { onHoverNode } from '../transforms/onHoverNode';

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /** Current value of dropLine. */
  dropLine: string;

  /** Id of the node. */
  id: string;

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
    editor: TEditor,
    props: {
      dragItem: DragItemNode;
      id: string;
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
  editor: TEditor,
  {
    dropLine,
    id,
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
      const handled =
        !!onDropHandler &&
        onDropHandler(editor, {
          dragItem,
          id,
          monitor,
          nodeRef,
        });

      if (handled) return;

      onDropNode(editor, { dragItem, id, monitor, nodeRef });
    },
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      onHoverNode(editor, {
        dragItem: item,
        dropLine,
        id,
        monitor,
        nodeRef,
        onChangeDropLine,
      });
    },
    ...options,
  });
};
