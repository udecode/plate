import type { TElement } from 'platejs';
import type { PlateEditor } from 'platejs/react';

export type DragItemNode = ElementDragItemNode | FileDragItemNode;

export type DropDirection = 'bottom' | 'left' | 'right' | 'top' | undefined;

export type DropLineDirection = '' | 'bottom' | 'left' | 'right' | 'top';

export interface ElementDragItemNode {
  /** Required to identify the node(s). */
  id: string[] | string;
  [key: string]: unknown;
  editorId: string;
  element: TElement;
  editor?: SlateEditor;
}

export interface FileDragItemNode {
  dataTransfer: DataTransfer[];
  files: FileList;
  items: DataTransferItemList;
}
