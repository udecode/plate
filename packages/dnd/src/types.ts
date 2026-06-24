import type { Element } from '@platejs/plite';
import type { BasePlateEditor } from 'platejs';

export type DragItemNode = ElementDragItemNode | FileDragItemNode;

export type DropDirection = 'bottom' | 'left' | 'right' | 'top' | undefined;

export type DropLineDirection = '' | 'bottom' | 'left' | 'right' | 'top';

export type ElementDragItemNode = {
  /** Required to identify the node(s). */
  id: string[] | string;
  [key: string]: unknown;
  editorId: string;
  element: Element;
  editor?: BasePlateEditor;
};

export type FileDragItemNode = {
  dataTransfer: DataTransfer[];
  files: FileList;
  items: DataTransferItemList;
};
