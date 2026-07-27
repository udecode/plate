import type { PlateEditor } from '@platejs/core/react';
import type { DropTargetMonitor } from 'react-dnd';

import { PathApi } from '@platejs/plite';

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
  const { _isOver, dropTarget } = editor.plugin(DndPlugin).store.get();
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
      editor
        .plugin(DndPlugin)
        .store.set({ dropTarget: { id: null, line: '' } });
    }

    return;
  }

  const { direction } = result;
  const elementId = element.id;

  if (typeof elementId !== 'string') return;

  const newDropTarget = { id: elementId, line: direction };

  if (newDropTarget.id !== currentId || newDropTarget.line !== currentLine) {
    // Only set if there's a real change

    if (!_isOver) {
      return;
    }

    if (newDropTarget.line === 'top') {
      const elementPath = editor.read.nodes.path(element);

      if (!elementPath) return;

      const previousPath = PathApi.previous(elementPath);

      if (!previousPath) {
        return editor
          .plugin(DndPlugin)
          .store.set({ dropTarget: newDropTarget });
      }

      const nextNode = editor.read.nodes.get(previousPath)?.[0];

      if (typeof nextNode?.id !== 'string') {
        return editor
          .plugin(DndPlugin)
          .store.set({ dropTarget: newDropTarget });
      }

      editor.plugin(DndPlugin).store.set({
        dropTarget: {
          id: nextNode.id,
          line: 'bottom',
        },
      });

      return;
    }

    editor.plugin(DndPlugin).store.set({ dropTarget: newDropTarget });
  }
  if (direction && editor.read.selection.isExpanded()) {
    editor.api.dom.focus();
    editor.update.selection.collapse({ edge: 'anchor' });
  }
};
