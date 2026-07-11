import type React from 'react';

import type { Element } from '@platejs/plite';
import type { DropTargetMonitor } from 'react-dnd';

import type { DragItemNode, DropDirection } from '../types';

export type GetHoverDirectionOptions = {
  dragItem: DragItemNode;
  /** The editor containing the hovered node. */
  editorId?: string;

  /** Hovering node. */
  element: Element;

  monitor: DropTargetMonitor;

  /** The node ref of the node being dragged. */
  nodeRef: React.RefObject<HTMLElement | null>;

  /** The orientation of the drag operation. */
  orientation?: 'horizontal' | 'vertical';
};

/**
 * If dragging a node A over another node B: get the direction of node A
 * relative to node B.
 */
export const getHoverDirection = ({
  dragItem,
  editorId,
  element,
  monitor,
  nodeRef,
  orientation = 'vertical',
}: GetHoverDirectionOptions): DropDirection => {
  if (!nodeRef.current) return;

  if ('element' in dragItem) {
    if (element === dragItem.element) return;

    const draggedIds = Array.isArray(dragItem.id) ? dragItem.id : [dragItem.id];

    if (
      (editorId === undefined || dragItem.editorId === editorId) &&
      typeof element.id === 'string' &&
      draggedIds.includes(element.id)
    ) {
      return;
    }
  }

  // Determine rectangle on screen
  const hoverBoundingRect = nodeRef.current.getBoundingClientRect();

  if (!hoverBoundingRect) {
    return;
  }

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();

  if (!clientOffset) {
    return;
  }
  if (orientation === 'vertical') {
    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (hoverClientY < hoverMiddleY) {
      return 'top';
    }
    // Dragging upwards
    if (hoverClientY >= hoverMiddleY) {
      return 'bottom';
    }
  } else {
    // Horizontal orientation for columns
    const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
    const hoverClientX = clientOffset.x - hoverBoundingRect.left;

    return hoverClientX < hoverMiddleX ? 'left' : 'right';
  }
};
