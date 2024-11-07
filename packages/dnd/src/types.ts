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

export type DropLineDirection = '' | 'bottom' | 'top';

export type DropDirection = 'bottom' | 'top' | undefined;
