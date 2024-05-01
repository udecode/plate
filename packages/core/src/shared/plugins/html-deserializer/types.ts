import { TDescendant } from '@udecode/slate';

export type DeserializeHtmlChildren<N extends TDescendant> =
  | ChildNode
  | N
  | string
  | null;

/**
 * De
 *
 */
export type DeserializeHtmlNodeReturnType<N extends TDescendant> =
  | string
  | null
  | N[]
  | N
  | DeserializeHtmlChildren<N>[];
