import { type DragSourceHookSpec, useDrag } from 'react-dnd';

import type { TEditor } from '@udecode/plate-common';

import type { DragItemNode } from '../types';

import { dndStore } from '../dndStore';

export interface UseDragNodeOptions
  extends DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }> {
  id: string;
}

/**
 * `useDrag` hook to drag a node from the editor. `item` with `id` is required.
 *
 * On drag start:
 *
 * - Set `editor.isDragging` to true
 * - Add `dragging` class to `body`
 *
 * On drag end:
 *
 * - Set `editor.isDragging` to false
 * - Remove `dragging` class to `body`
 *
 * Collect:
 *
 * - IsDragging: true if mouse is dragging the block
 */
export const useDragNode = (
  editor: TEditor,
  { id, item, ...options }: UseDragNodeOptions
) => {
  return useDrag<DragItemNode, unknown, { isDragging: boolean }>(
    () => ({
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        dndStore.set.isDragging(false);
        editor.isDragging = false;
        document.body.classList.remove('dragging');
      },
      item(monitor) {
        dndStore.set.isDragging(true);
        editor.isDragging = true;
        document.body.classList.add('dragging');

        const _item = typeof item === 'function' ? item(monitor) : item;

        return {
          editorId: editor.id,
          id,
          ..._item,
        };
      },
      ...options,
    }),
    []
  );
};
