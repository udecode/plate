import { UnknownObject } from '../../common/types/utility/AnyObject';
import { MyValue } from "../../utils/setPlatePlugins";
import { EDescendant, VDescendant } from "./TDescendant";
import { TEditor, Value } from './TEditor';
import { TNode } from './TNode';
import { TText } from './TText';

/**
 * `Element` objects are a type of node in a Slate document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Slate editor's configuration.
 */
export interface TElement extends UnknownObject {
  children: Array<TElement | TText>;
  type: string;
}

/**
 * Element of an editor.
 */
export type EElement<V extends Value> = ElementOf<TEditor<V>>;

/**
 * Element of a value.
 */
export type VElement<V extends Value> = V[number];

let  a: TElement = {type : 'a', children: []}
let b: EDescendant<MyValue> = {}

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
// export type TElementEntry = [TElement, Path];

/**
 * A utility type to get all the element nodes type from a root node.
 */
export type ElementOf<N extends TNode> = TEditor<Value> extends N
  ? TElement
  : TElement extends N
  ? TElement
  : N extends TEditor<Value>
  ? Extract<N['children'][number], TElement> | ElementOf<N['children'][number]>
  : N extends TElement
  ?
      | N
      | Extract<N['children'][number], TElement>
      | ElementOf<N['children'][number]>
  : never;
