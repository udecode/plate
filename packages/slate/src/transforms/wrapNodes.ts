import { Transforms } from 'slate';
import { TEditor, Value } from '../interfaces/editor/TEditor';
import { unhangRange } from '../interfaces/editor/unhangRange';
import { EElement } from '../interfaces/element/TElement';
import { Modify } from '../types/misc/types';
import { NodeMatchOption } from '../types/NodeMatchOption';

export type WrapNodesOptions<V extends Value = Value> = Modify<
  NonNullable<Parameters<typeof Transforms.wrapNodes>[2]>,
  NodeMatchOption<V>
>;

/**
 * Wrap the nodes at a location in a new container node, splitting the edges
 * of the range first to ensure that only the content in the range is wrapped.
 */
export const wrapNodes = <N extends EElement<V>, V extends Value = Value>(
  editor: TEditor<V>,
  element: N,
  options?: WrapNodesOptions<V>
) => {
  unhangRange(editor, options?.at, options);

  Transforms.wrapNodes(editor as any, element as any, options as any);
};
