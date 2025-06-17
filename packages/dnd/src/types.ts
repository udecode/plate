import type { TElement } from 'platejs';

export type DragItemNode = ElementDragItemNode | FileDragItemNode;

export type DropDirection = 'bottom' | 'left' | 'right' | 'top' | undefined;

export type DropLineDirection = '' | 'bottom' | 'left' | 'right' | 'top';

export interface ElementDragItemNode {
  /** Required to identify the node. */
  id: string;
  [key: string]: unknown;
  element: TElement;
  /** Additional elements being dragged (for multi-node drag) */
  elements?: TElement[];
  /** All IDs being dragged (for multi-node drag) */
  ids?: string[];
}

export interface FileDragItemNode {
  dataTransfer: DataTransfer[];
  files: FileList;
  items: DataTransferItemList;
}
