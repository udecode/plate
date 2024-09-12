import type { TDescendant } from '@udecode/slate';

export type DeserializeHtmlChildren = ChildNode | TDescendant | string | null;

/** De */
export type DeserializeHtmlNodeReturnType =
  | DeserializeHtmlChildren[]
  | TDescendant
  | TDescendant[]
  | string
  | null;
