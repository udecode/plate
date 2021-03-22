import { TText } from '@udecode/slate-plugins-core';

export type ArrayOne<T> = [T];

export interface ArrayOneOrMore<T> extends Array<T> {
  0: T;
}

export type SlateDocumentFragment = ArrayOneOrMore<SlateDocumentDescendant>;

export interface SlateDocumentElement {
  [key: string]: any;
  type: string;
  children: SlateDocumentFragment;
}

export type SlateDocumentDescendant = SlateDocumentElement | TText;

/**
 * Strict document structure to be used as a Slate value.
 * It needs exactly one item with `children` property.
 * Each children needs at least one {@link SlateDocumentDescendant}.
 */
export type SlateDocument = ArrayOne<{
  children: SlateDocumentFragment;
}>;
