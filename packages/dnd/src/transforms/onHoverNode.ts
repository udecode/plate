import {
  TReactEditor,
  Value,
  collapseSelection,
  focusEditor,
  isExpanded,
} from '@udecode/plate-common';
import { DropTargetMonitor } from 'react-dnd';

import { UseDropNodeOptions } from '../hooks/useDropNode';
import { DragItemNode } from '../types';
import { getHoverDirection, getNewDirection } from '../utils';

/**
 * Callback called when dragging a node and hovering nodes.
 */
export const onHoverNode = <V extends Value>(
  editor: TReactEditor<V>,
  {
    dragItem,
    monitor,
    nodeRef,
    onChangeDropLine,
    dropLine,
    id,
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    'nodeRef' | 'onChangeDropLine' | 'id' | 'dropLine'
  >
) => {
  const direction = getHoverDirection({
    dragItem,
    monitor,
    nodeRef,
    id,
  });
  const dropLineDir = getNewDirection(dropLine, direction);
  if (dropLineDir) onChangeDropLine(dropLineDir);

  if (direction && isExpanded(editor.selection)) {
    focusEditor(editor);
    collapseSelection(editor);
  }
};
