import { Transforms } from 'slate';
import { NodeMatchOption } from '../../../types/slate/NodeMatchOption';
import { TEditor, Value } from '../../../types/slate/TEditor';
import { ElementOf } from '../../../types/slate/TElement';
import { unhangRange } from '../editor/unhangRange';

export type WrapNodesOptions<V extends Value> = Parameters<
  typeof Transforms.wrapNodes
>[2] &
  NodeMatchOption<V>;

/**
 * Wrap the nodes at a location in a new container node, splitting the edges
 * of the range first to ensure that only the content in the range is wrapped.
 */
export const wrapNodes = <V extends Value>(
  editor: TEditor<V>,
  element: ElementOf<TEditor<V>>,
  options?: WrapNodesOptions<V>
) => {
  unhangRange(editor, options?.at, options);

  Transforms.wrapNodes(editor as any, element as any, options as any);
};
