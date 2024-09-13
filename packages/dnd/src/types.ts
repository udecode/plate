export interface DragItemNode {
  /** Required to identify the node. */
  id: string;
  [key: string]: unknown;
}

export type DropLineDirection = '' | 'bottom' | 'top';

export type DropDirection = 'bottom' | 'top' | undefined;
