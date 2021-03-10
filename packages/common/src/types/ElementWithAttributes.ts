import { Element } from 'slate';

export type DeserializedAttributes = { [key: string]: any } | undefined;

export interface ElementWithAttributes extends Element {
  attributes?: DeserializedAttributes;
}
