import { Text } from 'slate';

export type ArrayOne<T> = [T];

export interface ArrayOneOrMore<T> extends Array<T> {
  0: T;
}

export type SlateDocumentFragment = ArrayOneOrMore<SlateDocumentDescendant>;

export interface SlateDocumentElement {
  children: SlateDocumentFragment;
  [key: string]: unknown;
}

export type SlateDocumentDescendant = SlateDocumentElement | Text;

/**
 * Strict document structure to be used as a Slate value.
 * It needs exactly one item with `children` property.
 * Each children needs at least one {@link SlateDocumentDescendant}.
 */
export type SlateDocument = ArrayOne<{
  children: SlateDocumentFragment;
}>;
