import { TDescendant, TElement } from '@udecode/plate-core';

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
