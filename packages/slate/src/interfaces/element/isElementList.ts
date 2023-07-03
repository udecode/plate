import { Element } from 'slate';

import { TElement } from './TElement';

/**
 * Check if a value is an array of `Element` objects.
 */
export const isElementList = (value: any): value is TElement[] =>
  Element.isElementList(value);
