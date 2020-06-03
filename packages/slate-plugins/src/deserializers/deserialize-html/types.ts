import { Descendant, Element } from 'slate';

export type DeserializeHTMLChildren = ChildNode | Descendant | string | null;

export type DeserializeHTMLReturn =
  | string
  | null
  | Descendant[]
  | Element
  | DeserializeHTMLChildren[];

export type DeserializedHTMLElement = Descendant;
