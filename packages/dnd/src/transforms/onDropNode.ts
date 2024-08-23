import type { DropTargetMonitor } from 'react-dnd';

import { type TEditor, findNode, moveNodes } from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';
import { Path } from 'slate';

import type { UseDropNodeOptions } from '../hooks';
import type { DragItemNode } from '../types';

import { getHoverDirection } from '../utils';

/** Callback called on drag an drop a node with id. */
export const onDropNode = (
  editor: TEditor,
  {
    dragItem,
    id,
    monitor,
    nodeRef,
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<UseDropNodeOptions, 'id' | 'nodeRef'>
) => {
  const direction = getHoverDirection({ dragItem, id, monitor, nodeRef });

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

    dropPath = [...nodePath.slice(0, -1), nodePath.at(-1)! - 1];

    if (Path.equals(dragPath, dropPath)) return;
  }
  if (direction) {
    const _dropPath = dropPath as Path;

    const before =
      Path.isBefore(dragPath, _dropPath) && Path.isSibling(dragPath, _dropPath);
    const to = before ? _dropPath : Path.next(_dropPath);

    moveNodes(editor, {
      at: dragPath,
      to,
    });
  }
};
