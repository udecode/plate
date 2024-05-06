import type { TDescendant } from '@udecode/slate';

export type DeserializeHtmlChildren<N extends TDescendant> =
  | ChildNode
  | N
  | null
  | string;

/** De */
export type DeserializeHtmlNodeReturnType<N extends TDescendant> =
  | DeserializeHtmlChildren<N>[]
  | N
  | N[]
  | null
  | string;
