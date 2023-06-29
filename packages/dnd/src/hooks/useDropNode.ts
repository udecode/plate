import { TEditor, TReactEditor, Value } from '@udecode/plate-common';
import { DropTargetHookSpec, DropTargetMonitor, useDrop } from 'react-dnd';

import { onDropNode } from '../transforms/onDropNode';
import { onHoverNode } from '../transforms/onHoverNode';
import { DragItemNode, DropLineDirection } from '../types';

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /**
   * The reference to the node being dragged.
   */
  nodeRef: any;

  /**
   * Id of the node.
   */
  id: string;

  /**
   * Current value of dropLine.
   */
  dropLine: string;

  /**
   * Callback called on dropLine change.
   */
  onChangeDropLine: (newValue: DropLineDirection) => void;
  /**
   * Intercepts the drop handling.
   * If `false` is returned, the default drop behavior is called after.
   * If `true` is returned, the default behavior is not called.
   */
  onDropHandler?: (
    editor: TEditor,
    props: {
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      dragItem: DragItemNode;
      nodeRef: any;
      id: string;
    }
  ) => boolean;
}

/**
 * `useDrop` hook to drop a node on the editor.
 *
 * On drop:
 * - get hover direction (top, bottom or undefined), return early if undefined
 * - dragPath: find node with id = dragItem.id, return early if not found
 * - focus editor
 * - dropPath: find node with id = id, its path should be next (bottom) or previous (top)
 * - move node from dragPath to dropPath
 *
 * On hover:
 * - get drop line direction
 * - if differs from dropLine, setDropLine is called
 *
 * Collect:
 * - isOver: true if mouse is over the block
 */
export const useDropNode = <V extends Value>(
  editor: TReactEditor<V>,
  {
    nodeRef,
    id,
    dropLine,
    onChangeDropLine,
    onDropHandler,
    ...options
  }: UseDropNodeOptions
) => {
  return useDrop<DragItemNode, unknown, { isOver: boolean }>({
    drop: (dragItem, monitor) => {
      const handled =
        !!onDropHandler &&
        onDropHandler(editor, {
          nodeRef,
          id,
          dragItem,
          monitor,
        });

      if (handled) return;

      onDropNode(editor, { nodeRef, id, dragItem, monitor });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      onHoverNode(editor, {
        nodeRef,
        id,
        dropLine,
        onChangeDropLine,
        dragItem: item,
        monitor,
      });
    },
    ...options,
  });
};
