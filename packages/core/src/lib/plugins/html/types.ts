import type { Descendant } from '@platejs/slate';

export type DeserializeHtmlChildren = ChildNode | Descendant | string | null;

/** De */
export type DeserializeHtmlNodeReturnType =
  | Descendant
  | Descendant[]
  | DeserializeHtmlChildren[]
  | string
  | null;
