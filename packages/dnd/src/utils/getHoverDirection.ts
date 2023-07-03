import { DropTargetMonitor, XYCoord } from 'react-dnd';

import { DragItemNode, DropDirection } from '../types';

export interface GetHoverDirectionOptions {
  dragItem: DragItemNode;

  monitor: DropTargetMonitor;

  /**
   * The node ref of the node being dragged.
   */
  nodeRef: any;

  /**
   * Hovering node id.
   */
  id: string;
}

/**
 * If dragging a node A over another node B:
 * get the direction of node A relative to node B.
 */
export const getHoverDirection = ({
  dragItem,
  id,
  monitor,
  nodeRef,
}: GetHoverDirectionOptions): DropDirection => {
  if (!nodeRef.current) return;

  const dragId = dragItem.id;

  // Don't replace items with themselves
  if (dragId === id) return;

  // Determine rectangle on screen
  const hoverBoundingRect = nodeRef.current?.getBoundingClientRect();

  // Get vertical middle
  const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

  // Determine mouse position
  const clientOffset = monitor.getClientOffset();
  if (!clientOffset) return;

  // Get pixels to the top
  const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

  // Only perform the move when the mouse has crossed half of the items height
  // When dragging downwards, only move when the cursor is below 50%
  // When dragging upwards, only move when the cursor is above 50%

  // Dragging downwards
  // if (dragId < hoverId && hoverClientY < hoverMiddleY) {
  if (hoverClientY < hoverMiddleY) {
    return 'top';
  }

  // Dragging upwards
  // if (dragId > hoverId && hoverClientY > hoverMiddleY) {
  if (hoverClientY >= hoverMiddleY) {
    return 'bottom';
  }
};
