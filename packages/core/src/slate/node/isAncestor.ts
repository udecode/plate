import { Element } from 'slate';
import { TAncestor } from '../types/TAncestor';

/**
 * Check if a value implements the 'Ancestor' interface.
 */
export const isAncestor = (value: any): value is TAncestor =>
  Element.isAncestor(value);
