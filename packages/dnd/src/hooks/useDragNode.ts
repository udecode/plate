import { type DragSourceHookSpec, useDrag } from 'react-dnd';

import type { TElement } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import type { DragItemNode } from '../types';

import { DndPlugin } from '../DndPlugin';

export interface UseDragNodeOptions
  extends DragSourceHookSpec<DragItemNode, unknown, { isDragging: boolean }> {
  element: TElement;
}

/**
 * `useDrag` hook to drag a node from the editor. `item` with `id` is required.
 *
 * On drag start:
 *
 * - Set `isDragging` to true
 * - Add `dragging` class to `body`
 *
 * On drag end:
 *
 * - Set `isDragging` to false
 * - Remove `dragging` class to `body`
 *
 * Collect:
 *
 * - IsDragging: true if mouse is dragging the block
 */
export const useDragNode = (
  editor: PlateEditor,
  { element: staleElement, item, ...options }: UseDragNodeOptions
) => {
  const elementId = staleElement.id as string;
  return useDrag<DragItemNode, unknown, { isDragging: boolean }>(
    () => ({
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        editor.setOption(DndPlugin, 'isDragging', false);
        document.body.classList.remove('dragging');
      },
      item(monitor) {
        editor.setOption(DndPlugin, 'isDragging', true);
        document.body.classList.add('dragging');

        const _item = typeof item === 'function' ? item(monitor) : item;
        const [element] = editor.api.node<TElement>({ id: elementId, at: [] })!;

        // Check if multiple nodes are selected
        const selectedIds = editor.getOption(DndPlugin, 'draggingIds');

        let elements: TElement[] = [];
        let ids: string[] = [];

        if (selectedIds && selectedIds.length > 1 && selectedIds.includes(elementId)) {
          // Multiple selection including current element
          ids = Array.from(selectedIds);
          elements = [];

          // Get all selected elements
          ids.forEach((id) => {
            const entry = editor.api.node<TElement>({ id, at: [] });
            if (entry) {
              elements.push(entry[0]);
            }
          });
        } else {
          // Single element drag
          elements = [element];
          ids = [elementId];
          editor.setOption(DndPlugin, 'draggingIds', [elementId]);
        }

        return {
          id: elementId,
          editorId: editor.id,
          element,
          elements,
          ids,
          ..._item,
        };
      },
      ...options,
    }),
    [editor, elementId]
  );
};
