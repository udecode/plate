import { Element } from 'slate';

import { TElement } from './TElement';

/**
 * Check if a value implements the 'Element' interface.
 */
export const isElement = (value: any): value is TElement =>
  Element.isElement(value);
