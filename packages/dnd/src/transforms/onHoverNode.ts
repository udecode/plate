import type { PlateEditor } from '@udecode/plate/react';
import type { DropTargetMonitor } from 'react-dnd';

import type { UseDropNodeOptions } from '../hooks/useDropNode';
import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';
import { getDropPath } from './onDropNode';

/** Callback called when dragging a node and hovering nodes. */
export const onHoverNode = (
  editor: PlateEditor,
  {
    canDropNode,
    dragItem,
    element,
    monitor,
    nodeRef,
    orientation = 'vertical',
  }: {
    dragItem: DragItemNode;
    monitor: DropTargetMonitor;
  } & Pick<
    UseDropNodeOptions,
    'canDropNode' | 'element' | 'nodeRef' | 'orientation'
  >
) => {
  const { dropTarget } = editor.getOptions(DndPlugin);
  const currentId = dropTarget?.id ?? null;
  const currentLine = dropTarget?.line ?? '';

  // Check if the drop would actually move the node.
  const result = getDropPath(editor, {
    canDropNode,
    dragItem,
    element,
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
  const newDropTarget = { id: element.id as string, line: direction };

  if (newDropTarget.id !== currentId || newDropTarget.line !== currentLine) {
    // Only set if there's a real change
    editor.setOption(DndPlugin, 'dropTarget', newDropTarget);
  }
  if (direction && editor.api.isExpanded()) {
    editor.tf.focus();
    editor.tf.collapse();
  }
};
