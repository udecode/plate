export interface DragItemNode {
  [key: string]: unknown;
  /** Required to identify the node. */
  id: string;
}

export type DropLineDirection = '' | 'bottom' | 'top';

export type DropDirection = 'bottom' | 'top' | undefined;
