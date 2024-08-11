import type { TDescendant } from '@udecode/slate';

export type DeserializeHtmlChildren = ChildNode | TDescendant | null | string;

/** De */
export type DeserializeHtmlNodeReturnType =
  | DeserializeHtmlChildren[]
  | TDescendant
  | TDescendant[]
  | null
  | string;
