import type { TElement } from '@udecode/plate-common';

export interface TResizableElement extends TElement {
  align?: 'center' | 'left' | 'right';
  width?: number;
}
