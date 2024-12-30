import { Element } from 'slate';

import type { TElement } from './TElement';

export const isElement = (value: any): value is TElement =>
  Element.isElement(value);
