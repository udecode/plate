import { UnknownObject } from '../../../../utils/src/types/AnyObject';
import { TEditor, Value } from '../editor/TEditor';
import { TDescendant } from '../node/TDescendant';
import { TNode } from '../node/TNode';
import { EText } from '../text/TText';

/**
 * `Element` objects are a type of node in a Slate document that contain other
 * element nodes or text nodes. They can be either "blocks" or "inlines"
 * depending on the Slate editor's configuration.
 */
export interface TElement extends UnknownObject {
  children: TDescendant[];
  type: string;
}

/**
 * Element of an editor.
 */
export type EElement<V extends Value> = ElementOf<TEditor<V>>;

/**
 * Element or text of an editor. Differs from EDescendant<V>.
 */
export type EElementOrText<V extends Value> = EElement<V> | EText<V>;

/**
 * `ElementEntry` objects refer to an `Element` and the `Path` where it can be
 * found inside a root node.
 */
// export type TElementEntry = [TElement, Path];

/**
 * A utility type to get all the element nodes type from a root node.
 */
export type ElementOf<N extends TNode> = TEditor extends N
  ? TElement
  : TElement extends N
  ? TElement
  : N extends TEditor
  ? Extract<N['children'][number], TElement> | ElementOf<N['children'][number]>
  : N extends TElement
  ?
      | N
      | Extract<N['children'][number], TElement>
      | ElementOf<N['children'][number]>
  : never;
