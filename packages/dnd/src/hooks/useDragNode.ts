import { TEditor, Value } from '@udecode/plate-common';
import { DragSourceHookSpec, useDrag } from 'react-dnd';

import { dndStore } from '../dndStore';
import { DragItemNode } from '../types';

export interface UseDragNodeOptions
  extends DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }> {
  id: string;
}

/**
 * `useDrag` hook to drag a node from the editor. `item` with `id` is required.
 *
 * On drag start:
 * - set `editor.isDragging` to true
 * - add `dragging` class to `body`
 *
 * On drag end:
 * - set `editor.isDragging` to false
 * - remove `dragging` class to `body`
 *
 * Collect:
 * - isDragging: true if mouse is dragging the block
 */
export const useDragNode = <V extends Value>(
  editor: TEditor<V>,
  { id, item, ...options }: UseDragNodeOptions
) => {
  return useDrag<DragItemNode, unknown, { isDragging: boolean }>(
    () => ({
      item(monitor) {
        dndStore.set.isDragging(true);
        editor.isDragging = true;
        document.body.classList.add('dragging');

        const _item = typeof item === 'function' ? item(monitor) : item;

        return {
          id,
          editorId: editor.id,
          ..._item,
        };
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        dndStore.set.isDragging(false);
        editor.isDragging = false;
        document.body.classList.remove('dragging');
      },
      ...options,
    }),
    []
  );
};
