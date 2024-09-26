import type { DropTargetMonitor } from 'react-dnd';

import {
  type TEditor,
  collapseSelection,
  isExpanded,
} from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

import type { UseDropNodeOptions } from '../hooks/useDropNode';
import type { DragItemNode } from '../types';

import { getHoverDirection, getNewDirection } from '../utils';

/** Callback called when dragging a node and hovering nodes. */
export const onHoverNode = (
  editor: TEditor,
  {
    id,
    dragItem,
    dropLine,
    monitor,
    nodeRef,
    onChangeDropLine,
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    'dropLine' | 'id' | 'nodeRef' | 'onChangeDropLine'
  >
) => {
  const direction = getHoverDirection({
    id,
    dragItem,
    monitor,
    nodeRef,
  });
  const dropLineDir = getNewDirection(dropLine, direction);

  if (dropLineDir) onChangeDropLine(dropLineDir);
  if (direction && isExpanded(editor.selection)) {
    focusEditor(editor);
    collapseSelection(editor);
  }
};
