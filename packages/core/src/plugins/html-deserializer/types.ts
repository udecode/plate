import { TDescendant } from '../../slate/types/TDescendant';
import { TElement } from '../../slate/types/TElement';

export type DeserializeHtmlChildren = ChildNode | TDescendant | string | null;

/**
 * De
 *
 */
export type DeserializeHtmlNodeReturnType =
  | string
  | null
  | TDescendant[]
  | TElement
  | DeserializeHtmlChildren[];
