import { DropTargetMonitor, useDrop } from 'react-dnd';
import { Path, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { isExpanded } from '../../common/queries/isExpanded';
import { DragItemBlock } from '../components/Selectable.types';
import { getBlockPathById } from '../utils/getBlockPathById';
import { getHoverDirection } from '../utils/getHoverDirection';
import { getNewDirection } from '../utils/getNewDirection';

export const useDropBlockOnEditor = (
  editor: ReactEditor,
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

      const dragPath = getBlockPathById(editor, dragItem.id);
      if (!dragPath) return;

      ReactEditor.focus(editor);

      let dropPath: Path | undefined;
      if (direction === 'bottom') {
        dropPath = getBlockPathById(editor, id);
        if (!dropPath) return;

        if (Path.equals(dragPath, Path.next(dropPath))) return;
      }

      if (direction === 'top') {
        const nodePath = getBlockPathById(editor, id) as Path;

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
          Path.compare(dragPath, _dropPath) !== -1 &&
          Path.isSibling(dragPath, _dropPath);
        const to = before ? _dropPath : Path.next(_dropPath);

        Transforms.moveNodes(editor, {
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
        ReactEditor.focus(editor);
        Transforms.collapse(editor);
      }
    },
  });
};
