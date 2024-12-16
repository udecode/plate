export type DragItemNode = ElementDragItemNode | FileDragItemNode;

export interface ElementDragItemNode {
  /** Required to identify the node. */
  id: string;
  [key: string]: unknown;
}

export interface FileDragItemNode {
  dataTransfer: DataTransfer[];
  files: FileList;
  items: DataTransferItemList;
}

export type DropLineDirection = '' | 'bottom' | 'left' | 'right' | 'top';

export type DropDirection = 'bottom' | 'left' | 'right' | 'top' | undefined;
