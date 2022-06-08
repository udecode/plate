import { useDrag } from 'react-dnd';
import { DragSourceHookSpec } from 'react-dnd/src/hooks/types';
import { TEditor, Value, WithRequired } from '@udecode/plate-core';
import { DragItemNode } from '../types';

export interface UseDragNodeOptions<
  DragItem extends DragItemNode = DragItemNode
> extends WithRequired<
    DragSourceHookSpec<DragItem, unknown, { isDragging: boolean }>,
    'item'
  > {}

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
export const useDragNode = <
  V extends Value,
  DragItem extends DragItemNode = DragItemNode
>(
  editor: TEditor<V>,
  { item, ...options }: UseDragNodeOptions<DragItem>
) => {
  return useDrag<DragItem, unknown, { isDragging: boolean }>(
    () => ({
      item(monitor) {
        editor.isDragging = true;
        document.body.classList.add('dragging');

        return typeof item === 'function' ? item(monitor) : item;
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        editor.isDragging = false;
        document.body.classList.remove('dragging');
      },
      ...options,
    }),
    []
  );
};
