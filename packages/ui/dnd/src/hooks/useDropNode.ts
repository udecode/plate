import { DropTargetMonitor, useDrop } from 'react-dnd';
import { DropTargetHookSpec } from 'react-dnd/src/hooks/types';
import {
  collapseSelection,
  findNode,
  focusEditor,
  isExpanded,
  moveNodes,
  TReactEditor,
  Value,
} from '@udecode/plate-core';
import { Path } from 'slate';
import { DragItemNode } from '../types';
import { getHoverDirection, getNewDirection } from '../utils/index';

export interface UseDropNodeOptions
  extends DropTargetHookSpec<DragItemNode, unknown, { isOver: boolean }> {
  /**
   * The reference to the block being dragged.
   */
  blockRef: any;
  id: string;
  dropLine: string;
  setDropLine: Function;
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
  { blockRef, id, dropLine, setDropLine, ...options }: UseDropNodeOptions
) => {
  return useDrop<DragItemNode, unknown, { isOver: boolean }>({
    drop: (dragItem, monitor) => {
      const direction = getHoverDirection(dragItem, monitor, blockRef, id);
      if (!direction) return;

      const dragEntry = findNode(editor, {
        at: [],
        match: { id: dragItem.id },
      });
      if (!dragEntry) return;
      const [, dragPath] = dragEntry;

      focusEditor(editor);

      let dropPath: Path | undefined;
      if (direction === 'bottom') {
        dropPath = findNode(editor, { at: [], match: { id } })?.[1];
        if (!dropPath) return;

        if (Path.equals(dragPath, Path.next(dropPath))) return;
      }

      if (direction === 'top') {
        const nodePath = findNode(editor, { at: [], match: { id } })?.[1];

        if (!nodePath) return;
        dropPath = [
          ...nodePath.slice(0, -1),
          nodePath[nodePath.length - 1] - 1,
        ];

        if (Path.equals(dragPath, dropPath)) return;
      }

      if (direction) {
        const _dropPath = dropPath as Path;

        const before =
          Path.isBefore(dragPath, _dropPath) &&
          Path.isSibling(dragPath, _dropPath);
        const to = before ? _dropPath : Path.next(_dropPath);

        moveNodes(editor, {
          at: dragPath,
          to,
        });
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
    hover(item: DragItemNode, monitor: DropTargetMonitor) {
      const direction = getHoverDirection(item, monitor, blockRef, id);
      const dropLineDir = getNewDirection(dropLine, direction);
      if (dropLineDir) setDropLine(dropLineDir);

      if (direction && isExpanded(editor.selection)) {
        focusEditor(editor);
        collapseSelection(editor);
      }
    },
    ...options,
  });
};
