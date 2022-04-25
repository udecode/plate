import { Text } from 'slate';
import { AnyObject, UnknownObject } from '../utility/AnyObject';
import { TEditor, Value } from './TEditor';
import { TElement } from './TElement';
import { TNode, TNodeProps } from './TNode';

/**
 * `Text` objects represent the nodes that contain the actual text content of a
 * Slate document along with any formatting properties. They are always leaf
 * nodes in the document tree as they cannot contain any children.
 */
export interface TText extends UnknownObject {
  text: string;
}

/**
 * A utility type to get all the text node types from a root node type.
 */
export type TextOf<N extends TNode> = TEditor<Value> extends N
  ? TText
  : TElement extends N
  ? TText
  : N extends TEditor<Value>
  ? TextOf<N['children'][number]>
  : N extends TElement
  ? Extract<N['children'][number], TText> | TextOf<N['children'][number]>
  : N extends TText
  ? N
  : never;

export const isText: <TExtension = AnyObject>(
  value: any
) => value is TText & TExtension = Text.isText as any;

/**
 * A utility type to get all the mark types from a root node type.
 */
export type MarksOf<N extends TNode> = Simplify<
  UnionToIntersection<TNodeProps<TextOf<N>>>
>;

export type MarkKeysOf<N extends Node> = {} extends MarksOf<N>
  ? unknown
  : keyof MarksOf<N>;
