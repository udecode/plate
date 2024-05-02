import { TElement } from '@udecode/plate-common/server';

export interface TResizableElement extends TElement {
  width?: number;
  align?: 'left' | 'center' | 'right';
}
