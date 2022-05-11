import { DropTargetMonitor, useDrop } from 'react-dnd';
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
import { DragItemBlock } from '../types';
import { getHoverDirection } from '../utils/getHoverDirection';
import { getNewDirection } from '../utils/getNewDirection';

export const useDropBlockOnEditor = <V extends Value>(
  editor: TReactEditor<V>,
  {
    blockRef,
    id,
    dropLine,
    setDropLine,
  }: {
    blockRef: any;
    id: string;
    dropLine: string;
    setDropLine: Function;
  }
) => {
  return useDrop({
    accept: 'block',
    drop: (dragItem: DragItemBlock, monitor: DropTargetMonitor) => {
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
    hover(item: DragItemBlock, monitor: DropTargetMonitor) {
      const direction = getHoverDirection(item, monitor, blockRef, id);
      const dropLineDir = getNewDirection(dropLine, direction);
      if (dropLineDir) setDropLine(dropLineDir);

      if (direction && isExpanded(editor.selection)) {
        focusEditor(editor);
        collapseSelection(editor);
      }
    },
  });
};
