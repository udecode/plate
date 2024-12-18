import type { DropTargetMonitor } from 'react-dnd';

import { collapseSelection, isExpanded } from '@udecode/plate-common';
import { type PlateEditor, focusEditor } from '@udecode/plate-common/react';

import type { UseDropNodeOptions } from '../hooks/useDropNode';
import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import { getDropPath } from './onDropNode';

/** Callback called when dragging a node and hovering nodes. */
export const onHoverNode = (
  editor: PlateEditor,
  {
    id,
    canDropNode,
    dragItem,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<UseDropNodeOptions, 'canDropNode' | 'id' | 'nodeRef' | 'orientation'>
) => {
  const { dropTarget } = editor.getOptions(DndPlugin);
  const currentId = dropTarget?.id ?? null;
  const currentLine = dropTarget?.line ?? '';

  // Check if the drop would actually move the node.
  const result = getDropPath(editor, {
    id,
    canDropNode,
    dragItem: dragItem as any,
    monitor,
    nodeRef,
    orientation,
  });

  // If getDropPath returns undefined, it means no actual move would happen.
  // In that case, don't show a drop target.
  if (!result) {
    if (currentId || currentLine) {
      editor.setOption(DndPlugin, 'dropTarget', { id: null, line: '' });
    }

    return;
  }

  const { direction } = result;
  const newDropTarget = { id, line: direction };

  if (newDropTarget.id !== currentId || newDropTarget.line !== currentLine) {
    // Only set if there's a real change
    editor.setOption(DndPlugin, 'dropTarget', newDropTarget);
  }
  if (direction && isExpanded(editor.selection)) {
    focusEditor(editor);
    collapseSelection(editor);
  }
};
