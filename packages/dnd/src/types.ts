import type { TElement } from '@udecode/plate';

export type DragItemNode = ElementDragItemNode | FileDragItemNode;

export type DropDirection = 'bottom' | 'left' | 'right' | 'top' | undefined;

export type DropLineDirection = '' | 'bottom' | 'left' | 'right' | 'top';

export interface ElementDragItemNode {
  /** Required to identify the node. */
  id: string;
  [key: string]: unknown;
  element: TElement;
}

export interface FileDragItemNode {
  dataTransfer: DataTransfer[];
  files: FileList;
  items: DataTransferItemList;
}
