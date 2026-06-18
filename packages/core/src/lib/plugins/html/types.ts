import type { Descendant } from '@platejs/slate-legacy';

export type DeserializeHtmlChildren = ChildNode | Descendant | string | null;

/** De */
export type DeserializeHtmlNodeReturnType =
  | Descendant
  | Descendant[]
  | DeserializeHtmlChildren[]
  | string
  | null;
