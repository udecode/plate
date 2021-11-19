import { TDescendant } from '../../types/slate/TDescendant';
import { TElement } from '../../types/slate/TElement';

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
