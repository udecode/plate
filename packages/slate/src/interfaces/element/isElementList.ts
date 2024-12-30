import { Element } from 'slate';

import type { TElement } from './TElement';

export const isElementList = (value: any): value is TElement[] =>
  Element.isElementList(value);
