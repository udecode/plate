import { TDescendant, TElement } from '@udecode/plate-core';

export type DeserializeHTMLChildren = ChildNode | TDescendant | string | null;

export type DeserializeHTMLReturn =
  | string
  | null
  | TDescendant[]
  | TElement
  | DeserializeHTMLChildren[];

export type DeserializedHTMLElement = TDescendant;
