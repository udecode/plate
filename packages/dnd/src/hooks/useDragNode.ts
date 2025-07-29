import React from 'react';
import { type ConnectDragPreview, type ConnectDragSource, type DragSourceHookSpec, useDrag } from 'react-dnd';

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
): [
  { isAboutToDrag: boolean; isDragging: boolean; },
  ConnectDragSource,
  ConnectDragPreview
] => {
  const elementId = staleElement.id as string;
  const [isAboutToDrag, setIsAboutToDrag] = React.useState(false);
  
  const [collected, dragRef, preview] = useDrag<DragItemNode, unknown, { isDragging: boolean }>(
    () => ({
      canDrag: () => {
        setIsAboutToDrag(true);
        return true;
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: () => {
        editor.setOption(DndPlugin, 'isDragging', false);
        document.body.classList.remove('dragging');
        setIsAboutToDrag(false);
      },
      item(monitor) {
        editor.setOption(DndPlugin, 'isDragging', true);
        editor.setOption(DndPlugin, '_isOver', true);
        document.body.classList.add('dragging');

        const _item = typeof item === 'function' ? item(monitor) : item;
        const [element] = editor.api.node<TElement>({ id: elementId, at: [] })!;

        // Check if multiple nodes are selected
        const currentDraggingId = editor.getOption(DndPlugin, 'draggingId');

        let id: string[] | string;

        if (
          Array.isArray(currentDraggingId) &&
          currentDraggingId.length > 1 &&
          currentDraggingId.includes(elementId)
        ) {
          // Multiple selection including current element
          id = Array.from(currentDraggingId);
        } else {
          // Single element drag
          id = elementId;
          editor.setOption(DndPlugin, 'draggingId', elementId);
        }

        return {
          id,
          editorId: editor.id,
          element,
          ..._item,
        };
      },
      ...options,
    }),
    [editor, elementId]
  );
  
  // Reset isAboutToDrag when drag is cancelled (e.g., ESC key)
  React.useEffect(() => {
    if (!collected.isDragging && isAboutToDrag) {
      setIsAboutToDrag(false);
    }
  }, [collected.isDragging, isAboutToDrag]);
  
  return [{ ...collected, isAboutToDrag }, dragRef, preview];
};
