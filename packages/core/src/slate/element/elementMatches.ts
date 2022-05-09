import { Element } from 'slate';
import { TElement } from './TElement';

/**
 * Check if an element matches set of properties.
 *
 * Note: this checks custom properties, and it does not ensure that any
 * children are equivalent.
 */
export const elementMatches = (element: TElement, props: object) =>
  Element.matches(element, props);
