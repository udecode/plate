import {
  type EElement,
  type InsertNodesOptions,
  type TEditor,
  type TElement,
  type Value,
  insertNodes,
} from '@udecode/slate';

export const insertElements = <V extends Value>(
  editor: TEditor<V>,
  nodes: TElement | TElement[],
  options?: InsertNodesOptions<V>
) => {
  insertNodes(editor, nodes as EElement<V> | EElement<V>[], options);
};
