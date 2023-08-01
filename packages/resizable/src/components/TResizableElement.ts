import { TElement } from '@udecode/plate-common';

export interface TResizableElement extends TElement {
  width?: number;
  align?: 'left' | 'center' | 'right';
}
