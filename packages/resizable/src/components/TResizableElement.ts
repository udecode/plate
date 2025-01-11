import type { TElement } from '@udecode/plate';

export interface TResizableElement extends TElement {
  align?: 'center' | 'left' | 'right';
  width?: number;
}
